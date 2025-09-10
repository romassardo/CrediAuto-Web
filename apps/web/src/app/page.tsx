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
        
        {/* Mobile Navigation - Solo botón Agencias */}
        <div className="flex md:hidden">
          <Link href="/login" prefetch={false} className="text-white px-3 py-2 rounded-xl font-sans font-medium hover:opacity-90 transition-colors text-sm" style={{backgroundColor: '#1E2480'}}>
            Agencias
          </Link>
        </div>

        {/* Desktop Navigation - Menú completo */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-12">
          <a href="#top" className="font-sans font-medium transition-colors hover:opacity-80" style={{color: '#1E2480', fontSize: 'clamp(0.85rem, 2vw, 1.44rem)'}}>Inicio</a>
          <a href="#quienes-somos" className="font-sans font-medium transition-colors hover:opacity-80" style={{color: '#1E2480', fontSize: 'clamp(0.85rem, 2vw, 1.44rem)'}}>Quienes somos</a>
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
          <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16">
            <div className="w-full flex flex-col justify-center h-full text-center md:text-left">
              <h1 className="font-sans font-black leading-none mb-4" style={{fontSize: 'clamp(2.2rem, 6vw, 5rem)', lineHeight: '0.9'}}>
                <span className="text-yellow-400">Tu crédito prendario</span>
              </h1>
              <h2 className="font-sans font-black leading-none mb-8 md:mb-10 lg:mb-12" style={{fontSize: 'clamp(2.2rem, 6vw, 5rem)', lineHeight: '0.9'}}>
                <span className="text-white">fácil y rápido</span>
              </h2>
              <div className="flex justify-center md:justify-start">
                <a href="#contacto" className="bg-yellow-400 text-black px-5 py-2.5 lg:px-6 lg:py-3 rounded-3xl font-sans font-black hover:bg-yellow-500 transition-colors shadow-xl" style={{fontSize: 'clamp(1.1rem, 2.5vw, 1.8rem)'}}>
                  Comenzar ahora
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Section */}
      <section className="pt-8 md:pt-12 lg:pt-20 xl:pt-32 pb-8 md:pb-12 lg:pb-16 text-center" style={{backgroundColor: '#f6f6f6'}}>
        <div className="mx-auto px-4 md:px-6 lg:px-8 xl:px-12 w-full max-w-[1200px] lg:max-w-[1400px] xl:max-w-[1800px] 2xl:max-w-[2400px]">
          <h2 className="font-sans font-black mb-4 lg:mb-6" style={{fontSize: 'clamp(2.5rem, 6vw, 4.5rem)'}}>
            <span style={{color: '#1E2480'}}>Tu próximo auto, </span>
            <span style={{color: '#FDB913'}}>hoy.</span>
          </h2>
          <p className="leading-tight mb-8 md:mb-12 lg:mb-16 mx-auto font-sans font-normal" style={{color: '#1E2480', fontSize: 'clamp(1.2rem, 3vw, 2.2rem)'}}>
            Accedé a créditos prendarios simples y transparentes
          </p>

          {/* SVG Icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-2 lg:gap-0 w-full mx-auto max-w-[1200px] lg:max-w-[1400px]">
            <div className="flex justify-center items-center">
              <img
                src="/Recurso 17.svg"
                alt="Hasta el 70% del valor"
                className="w-full max-w-[280px] md:max-w-[320px] lg:max-w-[380px] xl:max-w-[450px] h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]"
              />
            </div>
            
            <div className="flex items-center justify-center">
              <img
                src="/Recurso 18.svg"
                alt="Hasta 60 cuotas"
                className="w-full max-w-[280px] md:max-w-[320px] lg:max-w-[380px] xl:max-w-[450px] h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]"
              />
            </div>
            
            <div className="flex items-center justify-center">
              <img
                src="/Recurso 19.svg"
                alt="0KM hasta 15 años"
                className="w-full max-w-[280px] md:max-w-[320px] lg:max-w-[380px] xl:max-w-[450px] h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Background gradiente que se extiende desde Agencias hasta Quiénes Somos */}
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
        <section className="py-16 md:py-20 lg:py-24">
          <div className="mx-auto px-4 md:px-6 lg:px-8 xl:px-12 w-full max-w-[1200px] lg:max-w-[1400px] xl:max-w-[1600px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-y-8 lg:gap-y-10 gap-x-4 lg:gap-x-8">
              <div className="relative shrink-0 self-center order-2 lg:order-1">
                <img
                  src="/Foto.png"
                  alt="Entrega de llaves de auto"
                  className="rounded-2xl w-full max-w-[500px] md:max-w-[600px] lg:max-w-[700px] xl:max-w-[800px] block mx-auto lg:ml-auto lg:scale-[1.1] xl:scale-[1.2] lg:origin-center"
                  style={{ height: 'auto' }}
                />
              </div>
              <div className="relative text-white w-full self-center order-1 lg:order-2 pl-0 lg:pl-8 xl:pl-12">
                <div className="space-y-4 lg:space-y-6 text-center lg:text-left">
                  <div className="space-y-1 lg:space-y-2">
                    <h2 className="font-sans font-black tracking-tight leading-[0.95] m-0" style={{fontSize: 'clamp(2.5rem, 5vw, 4rem)'}}>
                      <span style={{color: '#1E2480'}}>Agencias &</span>
                    </h2>
                    <h2 className="font-sans font-black tracking-tight leading-[0.95]" style={{color: '#FFFFFF', fontSize: 'clamp(2.5rem, 5vw, 4rem)'}}>
                      concesionarios
                    </h2>
                  </div>
                  <div className="h-[3px] lg:h-[4px] bg-white w-[18ch] lg:w-[22ch] mx-auto lg:mx-0"></div>

                  <p className="leading-[1.15] font-sans font-normal max-w-[500px] mx-auto lg:mx-0" style={{color: '#1E2480', fontSize: 'clamp(1.4rem, 2.8vw, 2.2rem)'}}>
                    Sumate a nuestra red de ventas, ofrecé la mejor financiación y aumenta tus operaciones.
                  </p>

                  <div className="pt-2">
                    <Link href="/portal/registro-concesionario" className="inline-flex items-center bg-white text-black px-4 py-3 lg:px-[18px] lg:py-[12px] rounded-2xl font-sans font-medium shadow-[0_10px_24px_rgba(0,0,0,0.2)] hover:bg-gray-100 transition-colors" style={{fontSize: 'clamp(1rem, 1.8vw, 1.5rem)'}}>
                      Regístrate ahora
                    </Link>
                  </div>

                  <p className="font-sans font-medium max-w-[500px] mx-auto lg:mx-0" style={{color: '#1E2480', fontSize: 'clamp(0.95rem, 1.6vw, 1.4rem)'}}>
                    Si ya tenes usuario podés <Link href="/login" prefetch={false} className="underline font-sans font-black" style={{color: '#1E2480'}}>simular tu crédito</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Porque sabemos que cada operación cuenta */}
      <section className="py-16 md:py-20 lg:py-24 overflow-visible">
        <div className="mx-auto px-4 md:px-6 lg:px-8 xl:px-12 max-w-[1200px] lg:max-w-[1400px] xl:max-w-[1600px] overflow-visible w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-y-8 lg:gap-y-0 gap-x-4 lg:gap-x-8">
            <div className="text-white order-2 lg:order-1">
              <div className="text-center lg:text-left">
                <h2 className="font-sans font-black mb-1 lg:mb-2 leading-[0.95]" style={{fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)'}}>
                  Porque sabemos que
                </h2>
                <h2 className="font-sans font-black text-yellow-400 mb-8 lg:mb-12 leading-[0.95]" style={{fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)'}}>
                  cada operación cuenta
                </h2>
                <div className="space-y-6 lg:space-y-8 xl:space-y-12 max-w-[500px] mx-auto lg:mx-0">
                  <div className="flex items-center gap-4 lg:gap-6 xl:gap-8">
                    <div className="flex-shrink-0">
                      <Image
                        src="/calendario.png"
                        alt="Calendario"
                        width={50}
                        height={50}
                        className="lg:w-[60px] lg:h-[60px] xl:w-[70px] xl:h-[70px]"
                      />
                    </div>
                    <span className="font-sans font-medium leading-[1.1]" style={{fontSize: 'clamp(1rem, 2.5vw, 1.8rem)'}}>Rapidez en la aprobación</span>
                  </div>
                  <div className="flex items-center gap-4 lg:gap-6 xl:gap-8">
                    <div className="flex-shrink-0">
                      <Image
                        src="/candado.png"
                        alt="Candado"
                        width={50}
                        height={50}
                        className="lg:w-[60px] lg:h-[60px] xl:w-[70px] xl:h-[70px]"
                      />
                    </div>
                    <span className="font-sans font-medium leading-[1.1]" style={{fontSize: 'clamp(1rem, 2.5vw, 1.8rem)'}}>Tasas competitivas, nos ajustamos al perfil de cada cliente</span>
                  </div>
                  <div className="flex items-center gap-4 lg:gap-6 xl:gap-8">
                    <div className="flex-shrink-0">
                      <Image
                        src="/billetera.png"
                        alt="Billetera"
                        width={50}
                        height={50}
                        className="lg:w-[60px] lg:h-[60px] xl:w-[70px] xl:h-[70px]"
                      />
                    </div>
                    <span className="font-sans font-medium leading-[1.1]" style={{fontSize: 'clamp(1rem, 2.5vw, 1.8rem)'}}>Respaldo en las sucursales</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative min-h-[400px] lg:min-h-[500px] xl:min-h-[600px] overflow-visible z-20 order-1 lg:order-2">
              <img
                src="/Auto.png"
                alt="Auto"
                className="absolute top-1/2 left-1/2 lg:left-auto lg:right-0 h-auto w-[110%] lg:w-[120%] xl:w-[132%] max-w-none transform -translate-y-1/2 -translate-x-1/2 lg:translate-x-0 lg:translate-x-[10%] xl:translate-x-[15%] z-30"
              />
            </div>
          </div>
        </div>
        </section>

        {/* Quienes Somos Section */}
        <section id="quienes-somos" className="scroll-mt-20 md:scroll-mt-24 lg:scroll-mt-32 py-16 md:py-20 lg:py-24 xl:py-32">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
              <div className="rounded-2xl lg:rounded-3xl p-8 md:p-10 lg:p-12 xl:p-16 border border-gray-100/50" style={{ backgroundColor: '#f6f6f6', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2), 0 12px 24px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)' }}>
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8 lg:mb-12">
                    <h2 className="font-sans font-black mb-6 lg:mb-8" style={{ color: '#1E2480', fontSize: 'clamp(3rem, 5vw, 4.5rem)' }}>
                      Quiénes somos
                    </h2>
                    <div className="w-24 h-1 mx-auto mb-6 lg:mb-8 rounded-full" style={{ backgroundColor: '#FFC107' }}></div>
                  </div>
                  
                  <p className="font-sans font-normal leading-relaxed text-center" style={{ color: '#374151', fontSize: 'clamp(1.2rem, 2vw, 1.8rem)', lineHeight: '1.7' }}>
                    Somos una red que conecta concesionarios con soluciones financieras simples y eficientes. Nuestra misión es facilitar el acceso a créditos prendarios con herramientas ágiles, seguras y pensadas para que cada operación sea más rápida y transparente. 
                    <br /><br />
                    <span className="font-medium" style={{ color: '#1E2480' }}>Creemos en el trabajo en conjunto y en acompañar a nuestros socios para que puedan enfocarse en lo que mejor saben hacer: vender más y crecer con confianza.</span>
                  </p>
                  
                  {/* Elementos visuales decorativos */}
                  <div className="flex justify-center items-center mt-8 lg:mt-12 space-x-4 lg:space-x-8">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#1E2480' }}></div>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FFC107' }}></div>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#1E2480' }}></div>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FFC107' }}></div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#1E2480' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contacto" className="scroll-mt-20 md:scroll-mt-24 lg:scroll-mt-32 pt-12 md:pt-16 lg:pt-24 xl:pt-32" style={{ paddingBottom: '6rem' }}>
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
              {/* Form */}
              <div className="rounded-2xl lg:rounded-[2rem] p-8 md:p-10 lg:p-12 xl:p-16" style={{ backgroundColor: '#f6f6f6', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2), 0 12px 24px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)' }}>
                {/* Header */}
                <div className="text-center mb-8 lg:mb-12">
                  <h2 className="font-sans font-black mb-6 lg:mb-8" style={{ color: '#1E2480', fontSize: 'clamp(2.5rem, 4.5vw, 3.5rem)' }}>
                    Estamos para ayudarte
                  </h2>
                  <p className="font-sans font-normal max-w-3xl lg:max-w-4xl mx-auto" style={{color: '#1E2480', fontSize: 'clamp(1.2rem, 1.8vw, 1.6rem)'}}>
                    ¿Tenés dudas sobre nuestros créditos prendarios? Escribinos y te asesoramos sin compromiso.
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
