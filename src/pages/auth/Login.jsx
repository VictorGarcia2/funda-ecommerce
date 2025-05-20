import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-blue dark:text-light-darker">
            Iniciar Sesión
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full rounded-t-md border-0 py-1.5 px-3 bg-white dark:bg-dark text-slate-blue dark:text-light-darker ring-1 ring-inset ring-slate-blue/10 placeholder:text-slate-blue/60 dark:placeholder:text-light-darker/60 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary dark:focus:ring-accent-2 sm:text-sm sm:leading-6"
                placeholder="Correo electrónico"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full rounded-b-md border-0 py-1.5 px-3 bg-white dark:bg-dark text-slate-blue dark:text-light-darker ring-1 ring-inset ring-slate-blue/10 placeholder:text-slate-blue/60 dark:placeholder:text-light-darker/60 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary dark:focus:ring-accent-2 sm:text-sm sm:leading-6"
                placeholder="Contraseña"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-primary dark:bg-accent-2 px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90 dark:hover:bg-accent-2/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:focus-visible:outline-accent-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-blue/10 dark:border-light-darker/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-light dark:bg-dark px-2 text-slate-blue/60 dark:text-light-darker/60">
                O continuar con
              </span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="group relative flex w-full justify-center items-center gap-2 rounded-md bg-white dark:bg-dark px-3 py-2 text-sm font-semibold text-slate-blue dark:text-light-darker ring-1 ring-inset ring-slate-blue/10 hover:bg-light-darker dark:hover:bg-slate-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FcGoogle className="h-5 w-5" />
              Google
            </button>
          </div>
        </form>

        <p className="mt-2 text-center text-sm text-slate-blue/60 dark:text-light-darker/60">
          ¿No tienes una cuenta?{' '}
          <Link
            to="/register"
            className="font-medium text-primary dark:text-accent-2 hover:text-primary/90 dark:hover:text-accent-2/90"
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;