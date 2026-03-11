import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import { server } from '../../mocks/server';
import { http, HttpResponse, delay } from 'msw';

// ── Mock react-router-dom navigate ──────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// ── Mock useAuth ────────────────────────────────────────────────
const mockLogin = vi.fn();
const mockClearAuthExpiredMessage = vi.fn();
let mockAuthValues = {
    isAuthenticated: false,
    authExpiredMessage: null as string | null,
    login: mockLogin,
    clearAuthExpiredMessage: mockClearAuthExpiredMessage,
    user: null,
    token: null,
    isLoading: false,
    logout: vi.fn(),
    checkAuth: vi.fn(),
};

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => mockAuthValues,
}));

// ── Helper ──────────────────────────────────────────────────────
const renderLoginPage = () => {
    return render(
        <MemoryRouter initialEntries={['/login']}>
            <LoginPage />
        </MemoryRouter>,
    );
};

// ── Tests ───────────────────────────────────────────────────────
describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuthValues = {
            isAuthenticated: false,
            authExpiredMessage: null,
            login: mockLogin,
            clearAuthExpiredMessage: mockClearAuthExpiredMessage,
            user: null,
            token: null,
            isLoading: false,
            logout: vi.fn(),
            checkAuth: vi.fn(),
        };
    });

    describe('前端元素', () => {
        it('應正確渲染登入頁面的所有元素', () => {
            renderLoginPage();

            expect(screen.getByText('歡迎回來')).toBeInTheDocument();
            expect(screen.getByText('請登入以繼續')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('至少 8 個字元，需包含英數')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登入' })).toBeInTheDocument();
        });

        it('應正確渲染表單欄位的 label', () => {
            renderLoginPage();

            expect(screen.getByLabelText('電子郵件')).toBeInTheDocument();
            expect(screen.getByLabelText('密碼')).toBeInTheDocument();
        });
    });

    describe('function 邏輯', () => {
        it('email 格式不正確時應顯示錯誤訊息', async () => {
            const user = userEvent.setup();
            renderLoginPage();

            await user.type(screen.getByLabelText('電子郵件'), 'invalid-email');
            await user.click(screen.getByRole('button', { name: '登入' }));

            expect(screen.getByText('請輸入有效的 Email 格式')).toBeInTheDocument();
        });

        it('密碼少於 8 個字元時應顯示錯誤訊息', async () => {
            const user = userEvent.setup();
            renderLoginPage();

            await user.type(screen.getByLabelText('電子郵件'), 'test@test.com');
            await user.type(screen.getByLabelText('密碼'), 'abc123');
            await user.click(screen.getByRole('button', { name: '登入' }));

            expect(screen.getByText('密碼必須至少 8 個字元')).toBeInTheDocument();
        });

        it('密碼沒有包含英文字母時應顯示錯誤訊息', async () => {
            const user = userEvent.setup();
            renderLoginPage();

            await user.type(screen.getByLabelText('電子郵件'), 'test@test.com');
            await user.type(screen.getByLabelText('密碼'), '12345678');
            await user.click(screen.getByRole('button', { name: '登入' }));

            expect(screen.getByText('密碼必須包含英文字母和數字')).toBeInTheDocument();
        });

        it('密碼沒有包含數字時應顯示錯誤訊息', async () => {
            const user = userEvent.setup();
            renderLoginPage();

            await user.type(screen.getByLabelText('電子郵件'), 'test@test.com');
            await user.type(screen.getByLabelText('密碼'), 'abcdefgh');
            await user.click(screen.getByRole('button', { name: '登入' }));

            expect(screen.getByText('密碼必須包含英文字母和數字')).toBeInTheDocument();
        });

        it('email 和密碼皆無效時應同時顯示兩個錯誤', async () => {
            const user = userEvent.setup();
            renderLoginPage();

            await user.type(screen.getByLabelText('電子郵件'), 'bad');
            await user.type(screen.getByLabelText('密碼'), '123');
            await user.click(screen.getByRole('button', { name: '登入' }));

            expect(screen.getByText('請輸入有效的 Email 格式')).toBeInTheDocument();
            expect(screen.getByText('密碼必須至少 8 個字元')).toBeInTheDocument();
        });

        it('驗證不通過時不應呼叫 login API', async () => {
            const user = userEvent.setup();
            renderLoginPage();

            await user.type(screen.getByLabelText('電子郵件'), 'invalid');
            await user.type(screen.getByLabelText('密碼'), 'short');
            await user.click(screen.getByRole('button', { name: '登入' }));

            expect(mockLogin).not.toHaveBeenCalled();
        });
    });

    describe('Mock API', () => {
        it('登入成功後應導向 /dashboard', async () => {
            mockLogin.mockResolvedValueOnce(undefined);
            const user = userEvent.setup();
            renderLoginPage();

            await user.type(screen.getByLabelText('電子郵件'), 'test@test.com');
            await user.type(screen.getByLabelText('密碼'), 'Test1234');
            await user.click(screen.getByRole('button', { name: '登入' }));

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'Test1234');
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
            });
        });

        it('登入按鈕在 loading 時應顯示「登入中...」且 disabled', async () => {
            // Make login hang so we can observe loading state
            mockLogin.mockImplementation(() => new Promise(() => { }));
            const user = userEvent.setup();
            renderLoginPage();

            await user.type(screen.getByLabelText('電子郵件'), 'test@test.com');
            await user.type(screen.getByLabelText('密碼'), 'Test1234');
            await user.click(screen.getByRole('button', { name: '登入' }));

            await waitFor(() => {
                expect(screen.getByText('登入中...')).toBeInTheDocument();
                expect(screen.getByRole('button')).toBeDisabled();
                expect(screen.getByLabelText('電子郵件')).toBeDisabled();
                expect(screen.getByLabelText('密碼')).toBeDisabled();
            });
        });

        it('API 回傳 401 時應顯示伺服器錯誤訊息', async () => {
            mockLogin.mockRejectedValueOnce({
                response: { data: { message: '密碼錯誤' } },
            });
            const user = userEvent.setup();
            renderLoginPage();

            await user.type(screen.getByLabelText('電子郵件'), 'test@test.com');
            await user.type(screen.getByLabelText('密碼'), 'Test1234');
            await user.click(screen.getByRole('button', { name: '登入' }));

            await waitFor(() => {
                const alert = screen.getByRole('alert');
                expect(alert).toHaveTextContent('密碼錯誤');
            });
        });

        it('API 回傳 500 時應顯示預設錯誤訊息', async () => {
            mockLogin.mockRejectedValueOnce({
                response: { data: {} },
            });
            const user = userEvent.setup();
            renderLoginPage();

            await user.type(screen.getByLabelText('電子郵件'), 'test@test.com');
            await user.type(screen.getByLabelText('密碼'), 'Test1234');
            await user.click(screen.getByRole('button', { name: '登入' }));

            await waitFor(() => {
                const alert = screen.getByRole('alert');
                expect(alert).toHaveTextContent('登入失敗，請稍後再試');
            });
        });

        it('API 錯誤後 loading 狀態應恢復', async () => {
            mockLogin.mockRejectedValueOnce({
                response: { data: { message: '密碼錯誤' } },
            });
            const user = userEvent.setup();
            renderLoginPage();

            await user.type(screen.getByLabelText('電子郵件'), 'test@test.com');
            await user.type(screen.getByLabelText('密碼'), 'Test1234');
            await user.click(screen.getByRole('button', { name: '登入' }));

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /登入/ })).not.toBeDisabled();
                expect(screen.getByLabelText('電子郵件')).not.toBeDisabled();
                expect(screen.getByLabelText('密碼')).not.toBeDisabled();
            });
        });
    });

    describe('驗證權限', () => {
        it('已登入用戶應自動導向 /dashboard', () => {
            mockAuthValues = {
                ...mockAuthValues,
                isAuthenticated: true,
            };
            renderLoginPage();

            expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
        });

        it('authExpiredMessage 存在時應顯示過期訊息並清除', () => {
            mockAuthValues = {
                ...mockAuthValues,
                authExpiredMessage: '登入已過期，請重新登入',
            };
            renderLoginPage();

            expect(screen.getByRole('alert')).toHaveTextContent('登入已過期，請重新登入');
            expect(mockClearAuthExpiredMessage).toHaveBeenCalled();
        });
    });
});
