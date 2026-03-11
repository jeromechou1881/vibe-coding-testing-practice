import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';
import { server } from '../../mocks/server';
import { http, HttpResponse, delay } from 'msw';

// ── Mock navigate ───────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// ── Mock useAuth ────────────────────────────────────────────────
const mockLogout = vi.fn();
let mockAuthValues = {
    user: { username: 'dean', role: 'admin' as 'admin' | 'user' },
    logout: mockLogout,
    token: 'fake-token',
    isLoading: false,
    isAuthenticated: true,
    authExpiredMessage: null,
    login: vi.fn(),
    checkAuth: vi.fn(),
    clearAuthExpiredMessage: vi.fn(),
};

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => mockAuthValues,
}));

// ── Mock products data ──────────────────────────────────────────
const mockProducts = [
    { id: 1, name: '筆記型電腦', price: 25000, description: '輕薄高效能筆記型電腦，適合工作與娛樂' },
    { id: 2, name: '無線滑鼠', price: 890, description: '人體工學設計，支援多裝置連接' },
    { id: 3, name: '機械鍵盤', price: 3200, description: '青軸機械鍵盤，打字手感極佳' },
];

// ── Helper ──────────────────────────────────────────────────────
const renderDashboardPage = () => {
    return render(
        <MemoryRouter initialEntries={['/dashboard']}>
            <DashboardPage />
        </MemoryRouter>,
    );
};

// ── Tests ───────────────────────────────────────────────────────
describe('DashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuthValues = {
            user: { username: 'dean', role: 'admin' },
            logout: mockLogout,
            token: 'fake-token',
            isLoading: false,
            isAuthenticated: true,
            authExpiredMessage: null,
            login: vi.fn(),
            checkAuth: vi.fn(),
            clearAuthExpiredMessage: vi.fn(),
        };
    });

    describe('前端元素', () => {
        it('應正確渲染儀表板頁面標題與登出按鈕', async () => {
            renderDashboardPage();

            expect(screen.getByText('儀表板')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();
        });

        it('應顯示使用者歡迎訊息與頭像', async () => {
            renderDashboardPage();

            await waitFor(() => {
                expect(screen.getByText('Welcome, dean 👋')).toBeInTheDocument();
            });
            expect(screen.getByText('D')).toBeInTheDocument();
            expect(screen.getByText('管理員')).toBeInTheDocument();
        });

        it('user 角色時應顯示「一般用戶」且不顯示管理後台連結', async () => {
            mockAuthValues = {
                ...mockAuthValues,
                user: { username: 'test', role: 'user' as const },
            };
            renderDashboardPage();

            expect(screen.getByText('一般用戶')).toBeInTheDocument();
            expect(screen.queryByText('🛠️ 管理後台')).not.toBeInTheDocument();
        });

        it('admin 角色時應顯示管理後台連結', async () => {
            renderDashboardPage();

            const adminLink = screen.getByText('🛠️ 管理後台');
            expect(adminLink).toBeInTheDocument();
            expect(adminLink.closest('a')).toHaveAttribute('href', '/admin');
        });
    });

    describe('Mock API', () => {
        it('應在載入中顯示 loading 狀態', async () => {
            server.use(
                http.get('/api/products', async () => {
                    await delay('infinite');
                    return HttpResponse.json({ products: mockProducts });
                }),
            );

            renderDashboardPage();

            expect(screen.getByText('載入商品中...')).toBeInTheDocument();
        });

        it('商品載入成功後應顯示商品列表', async () => {
            server.use(
                http.get('/api/products', () => {
                    return HttpResponse.json({ products: mockProducts });
                }),
            );

            renderDashboardPage();

            await waitFor(() => {
                expect(screen.getByText('筆記型電腦')).toBeInTheDocument();
            });
            expect(screen.getByText('輕薄高效能筆記型電腦，適合工作與娛樂')).toBeInTheDocument();
            expect(screen.getByText('NT$ 25,000')).toBeInTheDocument();

            expect(screen.getByText('無線滑鼠')).toBeInTheDocument();
            expect(screen.getByText('NT$ 890')).toBeInTheDocument();

            expect(screen.getByText('機械鍵盤')).toBeInTheDocument();
            expect(screen.getByText('NT$ 3,200')).toBeInTheDocument();
        });

        it('商品 API 回傳錯誤時應顯示錯誤訊息', async () => {
            server.use(
                http.get('/api/products', () => {
                    return HttpResponse.json(
                        { message: '伺服器錯誤，請稍後再試' },
                        { status: 500 },
                    );
                }),
            );

            renderDashboardPage();

            await waitFor(() => {
                expect(screen.getByText('伺服器錯誤，請稍後再試')).toBeInTheDocument();
            });
        });

        it('商品 API 回傳錯誤且無 message 時應顯示預設訊息', async () => {
            server.use(
                http.get('/api/products', () => {
                    return HttpResponse.json({}, { status: 500 });
                }),
            );

            renderDashboardPage();

            await waitFor(() => {
                expect(screen.getByText('無法載入商品資料')).toBeInTheDocument();
            });
        });
    });

    describe('function 邏輯', () => {
        it('點擊登出按鈕應呼叫 logout 並導向 /login', async () => {
            const user = userEvent.setup();
            renderDashboardPage();

            await user.click(screen.getByRole('button', { name: '登出' }));

            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });
});
