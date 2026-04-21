import PrimaryButton from "../components/PrimaryButton";
import TextBox from "../components/TextBox"
import { RiTimeLine } from 'react-icons/ri';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login , loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(employeeId, password);
    if (result.success) {
      navigate(result.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 to-slate-100">
      <form className="flex flex-col bg-white p-10 shadow-xl rounded-3xl gap-8 w-full max-w-md border border-slate-200"
        onSubmit={handleSubmit}>
        <div className="flex items-center gap-3">
          <div className="bg-primary p-3 rounded-2xl shadow-sm">
            <RiTimeLine className="w-8 h-8 text-white"/>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">DTR Tracker</h1>
            <p className="text-sm text-slate-500">Daily Time Record System</p>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-sm text-slate-500 mt-1">Sign in to access your time records</p>
        </div>

        <div className="flex flex-col gap-5">
          <TextBox
            label="ID Number"
            type="text"
            id="employeeID"
            value={employeeId}
            placeholder="e.g. EMP-001"
            onChange={(e) => setEmployeeId(e.target.value)} />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-slate-50 border border-slate-200 px-4 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <RiEyeLine className="w-5 h-5" /> : <RiEyeOffLine className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}
        
        <PrimaryButton
          text={loading ? 'Signing in...' : 'Sign in'}
          type="submit"
          disabled={loading}
       />
      </form>

    </div>
  )
}

export default LoginPage
