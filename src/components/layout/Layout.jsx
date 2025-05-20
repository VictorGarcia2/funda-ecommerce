import { useTheme } from '../../hooks/useTheme.jsx';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext.jsx';
import { Link } from 'react-router-dom';
import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { ShoppingCartIcon, UserIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Tienda', href: '/shop' },
    { name: 'Personalizar', href: '/customize' },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-dark' : 'bg-light'}`}>
      <Disclosure as="nav" className="bg-white dark:bg-dark shadow-soft dark:shadow-none">
        {({ open }) => (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <Link to="/" className="text-2xl font-bold text-primary dark:text-accent-2">
                      FundaStore
                    </Link>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-blue dark:text-light-darker hover:text-primary dark:hover:text-accent-2 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-slate-blue dark:text-light-darker hover:bg-light-darker dark:hover:bg-slate-blue/20 transition-colors"
                  >
                    {isDarkMode ? (
                      <SunIcon className="h-6 w-6" />
                    ) : (
                      <MoonIcon className="h-6 w-6" />
                    )}
                  </button>

                  <Link to="/cart" className="relative p-2">
                    <ShoppingCartIcon className="h-6 w-6 text-slate-blue dark:text-light-darker" />
                    {getItemCount() > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-accent rounded-full">
                        {getItemCount()}
                      </span>
                    )}
                  </Link>

                  <Menu as="div" className="relative ml-3">
                    <Menu.Button className="p-2 rounded-full text-slate-blue dark:text-light-darker hover:bg-light-darker dark:hover:bg-slate-blue/20 transition-colors">
                      <UserIcon className="h-6 w-6" />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-dark shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {user ? (
                          <>
                            {user.role === 'admin' && (
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to="/admin"
                                    className={`${active ? 'bg-light-darker dark:bg-slate-blue/20' : ''} block px-4 py-2 text-sm text-slate-blue dark:text-light-darker`}
                                  >
                                    Panel Admin
                                  </Link>
                                )}
                              </Menu.Item>
                            )}
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/profile"
                                  className={`${active ? 'bg-light-darker dark:bg-slate-blue/20' : ''} block px-4 py-2 text-sm text-slate-blue dark:text-light-darker`}
                                >
                                  Mi Perfil
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={logout}
                                  className={`${active ? 'bg-light-darker dark:bg-slate-blue/20' : ''} block w-full text-left px-4 py-2 text-sm text-slate-blue dark:text-light-darker`}
                                >
                                  Cerrar Sesión
                                </button>
                              )}
                            </Menu.Item>
                          </>
                        ) : (
                          <>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/login"
                                  className={`${active ? 'bg-light-darker dark:bg-slate-blue/20' : ''} block px-4 py-2 text-sm text-slate-blue dark:text-light-darker`}
                                >
                                  Iniciar Sesión
                                </Link>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  to="/register"
                                  className={`${active ? 'bg-light-darker dark:bg-slate-blue/20' : ''} block px-4 py-2 text-sm text-slate-blue dark:text-light-darker`}
                                >
                                  Registrarse
                                </Link>
                              )}
                            </Menu.Item>
                          </>
                        )}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>
          </>
        )}
      </Disclosure>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white dark:bg-dark shadow-soft dark:shadow-none mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-blue dark:text-light-darker">
            © {new Date().getFullYear()} FundaStore. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;