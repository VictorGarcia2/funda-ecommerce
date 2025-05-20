import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { user } = useAuth();
  const [designs, setDesigns] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch user's designs
        const designsQuery = query(
          collection(db, 'designs'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const designsSnapshot = await getDocs(designsQuery);
        setDesigns(designsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch user's orders
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        setOrders(ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError('Error al cargar los datos del perfil: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-blue dark:text-light-darker">
            Por favor, inicia sesión para ver tu perfil
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* User Info */}
        <div className="bg-white dark:bg-dark rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-slate-blue dark:text-light-darker mb-4">
            Información Personal
          </h2>
          <div className="space-y-2">
            <p className="text-slate-blue/80 dark:text-light-darker/80">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p className="text-slate-blue/80 dark:text-light-darker/80">
              <span className="font-medium">Miembro desde:</span>{' '}
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Saved Designs */}
        <div className="bg-white dark:bg-dark rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-slate-blue dark:text-light-darker mb-4">
            Mis Diseños
          </h2>
          {loading ? (
            <p className="text-slate-blue/60 dark:text-light-darker/60">Cargando diseños...</p>
          ) : designs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {designs.map(design => (
                <div
                  key={design.id}
                  className="bg-light-darker dark:bg-slate-blue/20 rounded-lg overflow-hidden"
                >
                  <img
                    src={design.imageUrl}
                    alt="Diseño guardado"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-sm text-slate-blue/60 dark:text-light-darker/60">
                      {new Date(design.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-blue/60 dark:text-light-darker/60">
              No tienes diseños guardados
            </p>
          )}
        </div>

        {/* Order History */}
        <div className="bg-white dark:bg-dark rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-slate-blue dark:text-light-darker mb-4">
            Historial de Pedidos
          </h2>
          {loading ? (
            <p className="text-slate-blue/60 dark:text-light-darker/60">Cargando pedidos...</p>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="bg-light-darker dark:bg-slate-blue/20 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-blue dark:text-light-darker">
                        Pedido #{order.id.slice(-6)}
                      </p>
                      <p className="text-sm text-slate-blue/60 dark:text-light-darker/60">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-bold text-primary dark:text-accent-2">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-slate-blue/80 dark:text-light-darker/80">
                      Estado: {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-blue/60 dark:text-light-darker/60">
              No tienes pedidos realizados
            </p>
          )}
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

export default Profile;