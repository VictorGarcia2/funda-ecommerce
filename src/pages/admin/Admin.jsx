import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import {
  ChartBarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const Admin = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user?.role === 'admin') return;

      try {
        // Fetch orders
        const ordersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc')
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);

        // Fetch users
        const usersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'user')
        );
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);

        // Calculate stats
        const totalRevenue = ordersData.reduce((sum, order) => sum + order.total, 0);
        setStats({
          totalOrders: ordersData.length,
          totalRevenue,
          totalUsers: usersData.length,
          averageOrderValue: ordersData.length > 0 ? totalRevenue / ordersData.length : 0
        });
      } catch (err) {
        setError('Error al cargar los datos de administración: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-blue dark:text-light-darker">
            Acceso denegado. Esta página es solo para administradores.
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-slate-blue dark:text-light-darker">
          Panel de Administración
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-dark rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-primary dark:text-accent-2" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-blue/60 dark:text-light-darker/60">
                  Pedidos Totales
                </p>
                <p className="text-2xl font-bold text-slate-blue dark:text-light-darker">
                  {stats.totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark rounded-lg shadow p-6">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-primary dark:text-accent-2" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-blue/60 dark:text-light-darker/60">
                  Ingresos Totales
                </p>
                <p className="text-2xl font-bold text-slate-blue dark:text-light-darker">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-primary dark:text-accent-2" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-blue/60 dark:text-light-darker/60">
                  Usuarios Totales
                </p>
                <p className="text-2xl font-bold text-slate-blue dark:text-light-darker">
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingBagIcon className="h-8 w-8 text-primary dark:text-accent-2" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-blue/60 dark:text-light-darker/60">
                  Valor Promedio de Pedido
                </p>
                <p className="text-2xl font-bold text-slate-blue dark:text-light-darker">
                  ${stats.averageOrderValue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="backdrop-blur-glass bg-glass-gradient bg-opacity-30 dark:bg-opacity-20 rounded-lg shadow-glass hover:shadow-glass-hover transition-shadow duration-300 overflow-hidden border border-white/20">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-blue dark:text-light-darker mb-4">
              Pedidos Recientes
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-blue/10 dark:divide-light-darker/10">
              <thead className="bg-light-darker dark:bg-slate-blue/20">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-blue/60 dark:text-light-darker/60 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-blue/60 dark:text-light-darker/60 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-blue/60 dark:text-light-darker/60 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-blue/60 dark:text-light-darker/60 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-blue/60 dark:text-light-darker/60 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark divide-y divide-slate-blue/10 dark:divide-light-darker/10">
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-blue dark:text-light-darker">
                      #{order.id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-blue dark:text-light-darker">
                      {order.userEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-blue dark:text-light-darker">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-blue dark:text-light-darker">
                      ${order.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users List */}
        <div className="backdrop-blur-glass bg-glass-gradient bg-opacity-30 dark:bg-opacity-20 rounded-lg shadow-glass hover:shadow-glass-hover transition-shadow duration-300 overflow-hidden border border-white/20">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-slate-blue dark:text-light-darker mb-4">
              Usuarios Registrados
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-blue/10 dark:divide-light-darker/10">
              <thead className="bg-light-darker dark:bg-slate-blue/20">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-blue/60 dark:text-light-darker/60 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-blue/60 dark:text-light-darker/60 uppercase tracking-wider">
                    Fecha de Registro
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark divide-y divide-slate-blue/10 dark:divide-light-darker/10">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-blue dark:text-light-darker">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-blue dark:text-light-darker">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon
                  className="h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error}
                </h3>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;