import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AdminPage } from '../AdminPage';

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

// ── Helper ──────────────────────────────────────────────────────
const renderAdminPage = () => {
    return render(
        <MemoryRouter initialEntries={['/admin']}>
            <AdminPage />
        </MemoryRouter>,
    );
};

// ── Tests ───────────────────────────────────────────────────────
describe('AdminPage', () => {
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
        it('應正確渲染管理後台頁面的所有元素', () => {
            renderAdminPage();

            expect(screen.getByText('🛠️ 管理後台')).toBeInTheDocument();
            expect(screen.getByText('← 返回')).toBeInTheDocument();
            expect(screen.getByText('管理員')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();
        });

        it('應顯示管理員專屬頁面資訊卡內容', () => {
            renderAdminPage();

            expect(screen.getByText('管理員專屬頁面')).toBeInTheDocument();
            expect(screen.getByText('只有 admin 角色可以訪問')).toBeInTheDocument();
            expect(screen.getByText('user 角色會被重定向')).toBeInTheDocument();
            expect(screen.getByText('受路由守衛保護')).toBeInTheDocument();
        });

        it('user 角色時應顯示「一般用戶」標籤', () => {
            mockAuthValues = {
                ...mockAuthValues,
                user: { username: 'test', role: 'user' as const },
            };
            renderAdminPage();

            expect(screen.getByText('一般用戶')).toBeInTheDocument();
        });
    });

    describe('function 邏輯', () => {
        it('點擊登出按鈕應呼叫 logout 並導向 /login', async () => {
            const user = userEvent.setup();
            renderAdminPage();

            await user.click(screen.getByRole('button', { name: '登出' }));

            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });

        it('返回連結應指向 /dashboard', () => {
            renderAdminPage();

            const backLink = screen.getByText('← 返回');
            expect(backLink.closest('a')).toHaveAttribute('href', '/dashboard');
        });
    });
});
