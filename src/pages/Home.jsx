import { Link } from 'react-router-dom';
import { ArrowRightIcon, SparklesIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const features = [
    {
      name: 'Diseño Personalizado',
      description: 'Crea tu diseño único con nuestra herramienta de personalización fácil de usar',
      icon: SparklesIcon,
    },
    {
      name: 'Materiales de Calidad',
      description: 'Materiales premium que aseguran durabilidad y protección para tu dispositivo',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Envío Rápido',
      description: 'Entrega rápida y segura hasta la puerta de tu casa',
      icon: TruckIcon,
    },
  ];

  const testimonials = [
    {
      name: 'Sara Jiménez',
      role: 'Diseñadora',
      content: '¡Las opciones de personalización son increíbles! Creé una funda única que combina perfectamente con mi estilo.',
    },
    {
      name: 'Miguel Castro',
      role: 'Entusiasta de la Tecnología',
      content: 'Calidad y protección excepcionales. Mi teléfono está seguro y se ve genial.',
    },
    {
      name: 'Laura Martínez',
      role: 'Fotógrafa',
      content: 'El proceso de diseño fue muy intuitivo y el producto final superó mis expectativas.',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-accent">
        <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
          <h1 className="text-center text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Diseña tu Funda Perfecta
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-center text-xl text-white/90 sm:max-w-2xl">
            Expresa tu estilo con nuestras fundas personalizables. Crea un diseño único tan especial como tú.
          </p>
          <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
            <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
              <Link
                to="/customize"
                className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-primary shadow-sm hover:bg-primary/10 hover:text-white transition-colors sm:px-8"
              >
                Comenzar a Diseñar
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/shop"
                className="flex items-center justify-center rounded-md border border-white bg-transparent px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-white/10 transition-colors sm:px-8"
              >
                Ver Colección
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative rounded-2xl border border-slate-blue/10 p-8 shadow-soft dark:shadow-none dark:bg-dark/50"
            >
              <div className="absolute top-8 left-8">
                <feature.icon className="h-8 w-8 text-primary dark:text-accent-2" />
              </div>
              <div className="mt-16">
                <h3 className="text-xl font-semibold text-slate-blue dark:text-light-darker">
                  {feature.name}
                </h3>
                <p className="mt-2 text-slate-blue/80 dark:text-light-darker/80">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-12">
        <h2 className="text-3xl font-bold text-center text-slate-blue dark:text-light-darker mb-12">
          Lo que Dicen Nuestros Clientes
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-2xl border border-slate-blue/10 p-8 shadow-soft dark:shadow-none dark:bg-dark/50"
            >
              <p className="text-slate-blue/80 dark:text-light-darker/80 italic">
                "{testimonial.content}"
              </p>
              <div className="mt-4">
                <p className="font-semibold text-slate-blue dark:text-light-darker">
                  {testimonial.name}
                </p>
                <p className="text-sm text-slate-blue/60 dark:text-light-darker/60">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;