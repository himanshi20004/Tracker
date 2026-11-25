import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Registration from '../pages/Register';
import ProtectedRoute from '../components/ProtectedRoute';
import QuizList from '../components/QuizList';
import TakeQuiz from '../components/Takequiz';
import api, { buildFileUrl } from '../utils/api';

describe('Frontend Security & Functionality Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('Registration page does not expose an Admin role selector', () => {
    render(
      <MemoryRouter>
        <Registration />
      </MemoryRouter>
    );

    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByText(/Admin/i)).toBeNull();
    expect(screen.getByText(/Student Registration/i)).toBeInTheDocument();
  });

  it('Registration validates password length and mismatch before submitting', async () => {
    const postSpy = vi.spyOn(api, 'post');
    render(
      <MemoryRouter>
        <Registration />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'student_one' } });
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 's1@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'short' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /Create student account/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 8 characters/i);
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('ProtectedRoute blocks unauthenticated users and blocks students from admin routes', () => {
    render(
      <MemoryRouter initialEntries={['/adminDashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Screen</div>} />
          <Route path="/userDashboard" element={<div>Student Screen</div>} />
          <Route
            path="/adminDashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div>Admin Secret</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Screen')).toBeInTheDocument();

    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('role', 'user');
    localStorage.setItem('user', JSON.stringify({ id: 'u1', role: 'user' }));

    render(
      <MemoryRouter initialEntries={['/adminDashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Screen</div>} />
          <Route path="/userDashboard" element={<div>Student Screen</div>} />
          <Route
            path="/adminDashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div>Admin Secret</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Student Screen')).toBeInTheDocument();
  });

  it('QuizList marks attempted and expired quizzes as disabled', () => {
    const quizzes = [
      {
        _id: 'q1',
        title: 'Attempted Quiz',
        timer: 60,
        totalPoints: 10,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        attemptedUsers: ['u1'],
      },
      {
        _id: 'q2',
        title: 'Open Quiz',
        timer: 60,
        totalPoints: 20,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        attemptedUsers: [],
      },
    ];

    const onTakeQuiz = vi.fn();
    render(<QuizList quizzes={quizzes} onTakeQuiz={onTakeQuiz} currentUserId="u1" />);

    expect(screen.getByText('✓ Submitted')).toBeDisabled();
    const takeBtn = screen.getByRole('button', { name: /Take Quiz/i });
    expect(takeBtn).not.toBeDisabled();
    fireEvent.click(takeBtn);
    expect(onTakeQuiz).toHaveBeenCalledWith(quizzes[1]);
  });

  it('TakeQuiz submits once and shows score summary modal before closing', async () => {
    const postSpy = vi.spyOn(api, 'post').mockResolvedValue({
      data: { score: 10, totalPoints: 10, totalUserPoints: 50 },
    });
    const onQuizSubmit = vi.fn();

    const quiz = {
      _id: 'q1',
      title: 'Chemistry Quiz',
      timer: 120,
      totalPoints: 10,
      questions: [
        { _id: 'ques1', questionText: 'H2O is?', options: ['Water', 'Salt'], points: 10 },
      ],
    };

    render(<TakeQuiz quiz={quiz} onQuizSubmit={onQuizSubmit} />);
    fireEvent.click(screen.getByLabelText('Water'));
    fireEvent.click(screen.getByRole('button', { name: /Submit Quiz/i }));

    await waitFor(() => {
      expect(screen.getByText(/Score: 10 \/ 10 Points/i)).toBeInTheDocument();
    });

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(onQuizSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /Back to Quizzes/i }));
    expect(onQuizSubmit).toHaveBeenCalledWith(50);
  });

  it('buildFileUrl normalizes Windows backslashes and uses configured API base URL', () => {
    const url = buildFileUrl('uploads\\12345-notes.pdf');
    expect(url).toMatch(/^https?:\/\/.+\/uploads\/12345-notes\.pdf$/);
    expect(url).not.toContain('\\');
  });
});
