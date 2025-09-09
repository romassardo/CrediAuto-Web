import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div id="top" className="min-h-screen bg-white overflow-x-hidden pt-20 md:pt-28">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-8 lg:px-16 py-3 md:py-6 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center">
          <img
            src="/recurso-15.svg"
            alt="Crediexpress Automotor"
            className="block h-auto w-[160px] md:w-[240px] lg:w-[320px]"
          />
        </div>
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-12">
          <a href="#top" className="font-sans font-medium transition-colors hover:opacity-80" style={{color: '#1E2480', fontSize: 'clamp(0.85rem, 2vw, 1.44rem)'}}>Inicio</a>
          <a href="#" className="font-sans font-medium transition-colors hover:opacity-80" style={{color: '#1E2480', fontSize: 'clamp(0.85rem, 2vw, 1.44rem)'}}>Quienes somos</a>
          <a href="#contacto" className="font-sans font-medium transition-colors hover:opacity-80" style={{color: '#1E2480', fontSize: 'clamp(0.85rem, 2vw, 1.44rem)'}}>Contacto</a>
          <Link href="/login" prefetch={false} className="text-white px-3 lg:px-6 py-1.5 lg:py-3 rounded-xl lg:rounded-2xl font-sans font-medium hover:opacity-90 transition-colors" style={{backgroundColor: '#1E2480', fontSize: 'clamp(0.85rem, 2vw, 1.44rem)'}}>
            Agencias
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/close-up-car-with-man-woman.jpg"
            alt="Auto en concesionario"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0">
          <Image
            src="/Recurso 1.svg"
            alt="Gradiente"
            fill
            className="object-cover"
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center min-h-screen">
          <div className="w-full px-4 md:px-8 lg:px-16">
            <div className="w-full flex flex-col justify-center h-full text-center md:text-left">
              <h1 className="font-sans font-black leading-none mb-4" style={{fontSize: 'clamp(2.5rem, 8vw, 6rem)', lineHeight: '0.9'}}>
                <span className="text-yellow-400">Tu crédito prendario</span>
              </h1>
              <h2 className="font-sans font-black leading-none mb-8 md:mb-12" style={{fontSize: 'clamp(2.5rem, 8vw, 6rem)', lineHeight: '0.9'}}>
                <span className="text-white">fácil y rápido</span>
              </h2>
              <div className="flex justify-center md:justify-start">
                <a href="#contacto" className="bg-yellow-400 text-black px-6 py-3 rounded-3xl font-sans font-black hover:bg-yellow-500 transition-colors shadow-xl" style={{fontSize: 'clamp(1.2rem, 3vw, 2rem)'}}>
                  Comenzar ahora
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Section */}
      <section className="pt-8 md:pt-16 lg:pt-32 pb-8 md:pb-16 text-center" style={{backgroundColor: '#f6f6f6'}}>
        <div className="mx-auto px-4 md:px-6 lg:px-12 w-full max-w-[1800px] xl:max-w-[2400px] 2xl:max-w-[2560px]">
          <h2 className="font-sans font-black mb-4" style={{fontSize: 'clamp(3rem, 9vw, 6rem)'}}>
            <span style={{color: '#1E2480'}}>Tu próximo auto, </span>
            <span style={{color: '#FDB913'}}>hoy.</span>
          </h2>
          <p className="leading-tight mb-8 md:mb-16 mx-auto font-sans font-normal whitespace-nowrap" style={{color: '#1E2480', fontSize: 'clamp(1.44rem, 4.8vw, 3rem)'}}>
            Accedé a créditos prendarios simples y transparentes
          </p>

          {/* SVG Icons */}
          <div className="flex flex-wrap justify-center gap-0 w-full mx-auto">
            <div className="flex justify-center items-center">
              <img
                src="/Recurso 17.svg"
                alt="Hasta el 70% del valor"
                className="w-full md:w-[408px] xl:w-[510px] h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]"
              />
            </div>
            
            <div className="flex items-center m-0 p-0">
              <img
                src="/Recurso 18.svg"
                alt="Hasta 60 cuotas"
                className="w-full md:w-[408px] xl:w-[510px] h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]"
              />
            </div>
            
            <div className="flex items-center m-0 p-0">
              <img
                src="/Recurso 19.svg"
                alt="0KM hasta 15 años"
                className="w-full md:w-[408px] xl:w-[510px] h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Background gradiente que se extiende desde Agencias hasta Formulario */}
      <div
        className="bg-no-repeat"
        style={{
          backgroundImage: "url('/Recurso 14.svg')",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'right top'
        }}
      >
        {/* Agencias & Concesionarios Section */}
        <section className="py-24">
          <div className="mx-auto px-6 md:px-12 w-full max-w-[1800px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-y-10 gap-x-0">
              <div className="relative shrink-0 self-center">
                <img
                  src="/Foto.png"
                  alt="Entrega de llaves de auto"
                  className="rounded-2xl w-full max-w-[1200px] block ml-auto lg:scale-[1.3] lg:origin-center"
                  style={{ height: 'auto' }}
                />
              </div>
              <div className="relative text-white w-full self-center max-w-[1500px] pl-6 md:pl-10 lg:pl-16">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="font-sans font-black tracking-tight leading-[0.95] m-0" style={{fontSize: 'clamp(3rem, 7vw, 5rem)'}}>
                      <span style={{color: '#1E2480'}}>Agencias &</span>
                    </h2>
                    <h2 className="font-sans font-black tracking-tight leading-[0.95]" style={{color: '#FFFFFF', fontSize: 'clamp(3rem, 7vw, 5rem)'}}>
                      concesionarios
                    </h2>
                  </div>
                  <div className="h-[4px] bg-white w-[22ch] text-[clamp(2rem,3.5vw,3rem)]"></div>

                  <p className="leading-[1.10] font-sans font-normal" style={{color: '#1E2480', fontSize: 'clamp(2rem, 3.5vw, 3rem)'}}>
                    Sumate a nuestra red de ventas,<br />
                    ofrecé la mejor financiación y<br />
                    aumenta tus operaciones.
                  </p>

                  <Link href="/portal/registro-concesionario" className="inline-flex items-center bg-white text-black px-[18px] py-[12px] rounded-2xl font-sans font-medium shadow-[0_10px_24px_rgba(0,0,0,0.2)] hover:bg-gray-100 transition-colors" style={{fontSize: 'clamp(1rem, 2.2vw, 1.75rem)'}}>
                    Regístrate ahora
                  </Link>

                  <p className="font-sans font-medium" style={{color: '#1E2480', fontSize: 'clamp(1rem, 2vw, 1.75rem)'}}>
                    Si ya tenes usuario podés <Link href="/login" prefetch={false} className="underline font-sans font-black" style={{color: '#1E2480'}}>simular tu crédito</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Porque sabemos que cada operación cuenta */}
      <section className="py-24 overflow-visible">
        <div className="mx-auto px-0 md:px-0 max-w-none overflow-visible w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            <div className="text-white">
              <div className="ml-6 md:ml-12 lg:ml-24 text-left">
                <h2 className="font-sans font-black mb-2 leading-[0.95]" style={{fontSize: 'clamp(2rem, 6vw, 4rem)'}}>
                  Porque sabemos que
                </h2>
                <h2 className="font-sans font-black text-yellow-400 mb-12 leading-[0.95]" style={{fontSize: 'clamp(2rem, 6vw, 4rem)'}}>
                  cada operación cuenta
                </h2>
                <div className="space-y-8 md:space-y-16">
                  <div className="flex items-center gap-6 md:gap-10">
                    <Image
                      src="/calendario.png"
                      alt="Calendario"
                      width={70}
                      height={70}
                    />
                    <span className="font-sans font-medium leading-[1.0]" style={{fontSize: 'clamp(1rem, 3.8vw, 2.5rem)'}}>Rapidez en la aprobación</span>
                  </div>
                  <div className="flex items-center gap-6 md:gap-10">
                    <Image
                      src="/candado.png"
                      alt="Candado"
                      width={70}
                      height={70}
                    />
                    <span className="font-sans font-medium leading-[1.0]" style={{fontSize: 'clamp(1rem, 3.8vw, 2.5rem)'}}>Tasas competitivas, nos ajustamos<br />al perfil de cada cliente</span>
                  </div>
                  <div className="flex items-center gap-6 md:gap-10">
                    <Image
                      src="/billetera.png"
                      alt="Billetera"
                      width={70}
                      height={70}
                    />
                    <span className="font-sans font-medium leading-[1.0]" style={{fontSize: 'clamp(1rem, 3.8vw, 2.5rem)'}}>Respaldo en las sucursales</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative min-h-[600px] overflow-visible z-20">
              <img
                src="/Auto.png"
                alt="Auto"
                className="absolute top-1/2 right-0 h-auto w-[132%] max-w-none transform -translate-y-1/2 translate-x-[15%] z-30"
              />
            </div>
          </div>
        </div>
        </section>

        {/* Contact Form */}
      <section id="contacto" className="scroll-mt-24 md:scroll-mt-32 pt-12 md:pt-24 lg:pt-32" style={{ paddingBottom: '8rem' }}>
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Form */}
            <div className="rounded-[2rem] p-12 lg:p-16" style={{ backgroundColor: '#f6f6f6', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2), 0 12px 24px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)' }}>
              {/* Header */}
              <div className="text-center mb-12">
                <h2 className="font-sans font-black mb-8" style={{ color: '#1E2480', fontSize: 'clamp(3rem, 5.5vw, 4rem)' }}>
                  Estamos para ayudarte
                </h2>
                <p className="font-sans font-normal max-w-4xl mx-auto" style={{color: '#1E2480', fontSize: 'clamp(1.4rem, 2vw, 1.8rem)'}}>
                  ¿Tenés dudas sobre nuestros créditos prendarios?<br />
                  Escribinos y te asesoramos sin compromiso.
                </p>
              </div>
              <form className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-lg font-sans font-medium text-gray-700">Nombre completo</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ingresá tu nombre"
                        className="w-full px-6 py-4 text-lg font-sans font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-lg"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-lg font-sans font-medium text-gray-700">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="tu@email.com"
                        className="w-full px-6 py-4 text-lg font-sans font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-lg"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-lg font-sans font-medium text-gray-700">Consulta</label>
                  <textarea
                    rows={4}
                    placeholder="Contanos en qué podemos ayudarte..."
                    className="w-full px-6 py-4 text-lg font-sans font-normal border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none shadow-lg"
                  ></textarea>
                </div>

                {/* Términos y condiciones */}
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="inline-flex items-start gap-4 max-w-3xl">
                      <input
                        type="checkbox"
                        id="aceptaContactoTerminos"
                        name="aceptaContactoTerminos"
                        className="mt-1.5 w-6 h-6 text-brand-primary-600 border-gray-300 rounded focus:ring-brand-primary-600"
                        required
                      />
                      <label htmlFor="aceptaContactoTerminos" className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed">
                        Acepto los <Link href="#" className="text-brand-primary-600 hover:underline font-semibold">términos y condiciones</Link> y autorizo el tratamiento de mis datos personales según la <Link href="#" className="text-brand-primary-600 hover:underline font-semibold">política de privacidad</Link>.
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-sans font-medium py-4 px-12 text-lg rounded-lg transition-all duration-200 transform hover:-translate-y-1"
                    style={{ boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)' }}
                  >
                    Enviar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        </section>
      </div>

    </div>
  );
}
