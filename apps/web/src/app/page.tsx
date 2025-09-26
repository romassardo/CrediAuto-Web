import Image from "next/image";
import Link from "next/link";
import ContactForm from "@/components/landing/ContactForm";

export default function Home() {
  return (
    <div id="top" className="min-h-screen bg-white overflow-x-hidden pt-16 lg:pt-18">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg shadow-gray-900/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-18">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img
                src="/recurso-15.svg"
                alt="Crediexpress Automotor"
                className="h-8 lg:h-10 w-auto"
              />
            </div>
            
            {/* Mobile Navigation */}
            <div className="flex md:hidden">
              <Link 
                href="/login" 
                prefetch={false} 
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md"
              >
                Ingreso al Portal
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <a 
                href="#top" 
                className="px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-all duration-200"
              >
                Inicio
              </a>
              <a 
                href="#agencias-concesionarios" 
                className="px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-all duration-200"
              >
                Agencias
              </a>
              <a 
                href="#quienes-somos" 
                className="px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-all duration-200"
              >
                Quienes somos
              </a>
              <a 
                href="#contacto" 
                className="px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-all duration-200"
              >
                Contacto
              </a>
              <div className="ml-6">
                <Link 
                  href="/login" 
                  prefetch={false} 
                  className="inline-flex items-center px-4 lg:px-6 py-2 lg:py-2.5 text-sm lg:text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Ingreso al Portal
                </Link>
              </div>
            </nav>
          </div>
        </div>
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
          <div className="flex flex-col md:flex-row gap-4 md:gap-2 lg:gap-0 w-full mx-auto max-w-[1200px] lg:max-w-[1400px] items-stretch">
            <div className="flex justify-center items-center flex-1 h-[280px] md:h-[300px] lg:h-[340px] xl:h-[380px]">
              <img
                src="/Recurso 17.svg"
                alt="Hasta el 70% del valor"
                className="h-full w-auto max-w-[450px] drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]"
              />
            </div>
            
            <div className="flex items-center justify-center flex-1 h-[280px] md:h-[300px] lg:h-[340px] xl:h-[380px]">
              <img
                src="/Recurso 18.svg"
                alt="Hasta 60 cuotas"
                className="h-full w-auto max-w-[450px] drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]"
              />
            </div>
            
            <div className="flex items-center justify-center flex-1 h-[280px] md:h-[300px] lg:h-[340px] xl:h-[380px]">
              <img
                src="/Recurso 19.svg"
                alt="0KM hasta 15 años"
                className="h-full w-auto max-w-[450px] drop-shadow-[0_15px_30px_rgba(0,0,0,0.25)]"
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
        <section id="agencias-concesionarios" className="scroll-mt-20 md:scroll-mt-24 lg:scroll-mt-32 py-16 md:py-20 lg:py-24">
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
                  
                  <p className="font-sans font-normal leading-relaxed text-center mb-6 lg:mb-8" style={{ color: '#374151', fontSize: 'clamp(1.2rem, 2vw, 1.8rem)', lineHeight: '1.7' }}>
                    <span className="font-medium" style={{ color: '#1E2480' }}>En Crediexpress</span> llevamos más de 25 años acompañando a través de soluciones financieras simples, seguras y accesibles. Nuestra experiencia en créditos personales, sumada a una amplia red de sucursales, nos posiciona como un socio confiable para agencias y concesionarios de todo el país.
                  </p>
                  
                  <p className="font-sans font-normal leading-relaxed text-center" style={{ color: '#374151', fontSize: 'clamp(1.2rem, 2vw, 1.8rem)', lineHeight: '1.7' }}>
                    Hoy, con la misma solidez que nos respalda desde nuestros inicios, damos un paso más hacia la <span className="font-medium" style={{ color: '#1E2480' }}>innovación digital con Crediexpress autos</span>, ofreciendo créditos prendarios y potenciando las ventas de vehículos. Creemos en la tecnología al servicio de las personas: procesos ágiles, atención cercana y la seguridad de contar con un equipo especializado que respalda cada operación.
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
        <section id="contacto" className="scroll-mt-20 md:scroll-mt-24 lg:scroll-mt-32 pt-12 md:pt-16 lg:pt-24 xl:pt-32 pb-4 md:pb-6">
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
                <ContactForm />
              </div>
            </div>
          </div>
        </section>

        {/* Contacto directo - WhatsApp y Email */}
        <section className="pt-4 md:pt-6 pb-6">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
              <div className="flex justify-center items-center gap-6">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/5491180243948"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 p-4 bg-gray-600 rounded-2xl hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  aria-label="WhatsApp Crediexpress Automotor"
                >
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#25D366" className="w-8 h-8">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-sm">WhatsApp</div>
                    <div className="text-gray-300 text-xs">11 8024 3948</div>
                    <div className="text-gray-400 text-xs mt-1">Envía un mensaje</div>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:prendarios@centeroffice.com.ar"
                  className="flex flex-col items-center gap-3 p-4 bg-gray-600 rounded-2xl hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  aria-label="Email Crediexpress Automotor"
                >
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                      <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="#1E2480" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-sm">Correo</div>
                    <div className="text-gray-300 text-xs">Contacto directo</div>
                    <div className="text-gray-400 text-xs mt-1">Envía un correo</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Main Footer Content */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              
              {/* Logo */}
              <div className="flex-shrink-0">
                <img
                  src="/recurso-15.svg"
                  alt="Crediexpress Automotor"
                  className="h-auto w-[160px] md:w-[180px]"
                />
              </div>

              {/* Social Media Icons - Center */}
              <div className="flex items-center gap-3">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/crediexpress.automotor?igsh=MTZzbndsY3p1aXc2cw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:shadow-md hover:border-gray-400 transition-all duration-200"
                  aria-label="Instagram Crediexpress Automotor"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                    <defs>
                      <radialGradient id="instagram-gradient" cx="0.25" cy="1.0" r="1.3">
                        <stop offset="0%" stopColor="#FED373"/>
                        <stop offset="25%" stopColor="#F15245"/>
                        <stop offset="50%" stopColor="#D92E7F"/>
                        <stop offset="75%" stopColor="#9B2FAE"/>
                        <stop offset="100%" stopColor="#8B3DFF"/>
                      </radialGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="6" ry="6" fill="url(#instagram-gradient)"/>
                    <circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="2"/>
                    <path d="M18.5 5.5h.01" fill="white" stroke="white" strokeWidth="1.5"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/share/1DEAH1HJGX/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:shadow-md hover:border-gray-400 transition-all duration-200"
                  aria-label="Facebook Crediexpress Automotor"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1877F2" className="w-5 h-5">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* X (formerly Twitter) */}
                <a
                  href="https://x.com/crediexpressautomotor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:shadow-md hover:border-gray-400 transition-all duration-200"
                  aria-label="X (Twitter) Crediexpress Automotor"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000" className="w-5 h-5">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com/@crediexpressautomotor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:shadow-md hover:border-gray-400 transition-all duration-200"
                  aria-label="YouTube Crediexpress Automotor"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000" className="w-5 h-5">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://tiktok.com/@crediexpressautomotor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:shadow-md hover:border-gray-400 transition-all duration-200"
                  aria-label="TikTok Crediexpress Automotor"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                    <path fill="#000000" d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:shadow-md hover:border-gray-400 transition-all duration-200 opacity-60"
                  aria-label="LinkedIn Crediexpress Automotor"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0077B5" className="w-5 h-5">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>

              {/* Institutional Links */}
              <div className="flex items-center gap-4 md:gap-6">
                <a 
                  href="https://www.bcra.gob.ar/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  title="Banco Central de la República Argentina"
                >
                  <img
                    src="/Banco Central.png"
                    alt="BCRA"
                    className="h-8 w-auto"
                  />
                </a>
                
                <a 
                  href="https://www.argentina.gob.ar/aaip/datospersonales/reclama" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  title="Protección de Datos Personales"
                >
                  <img
                    src="/Base de datos.jpg"
                    alt="Datos Personales"
                    className="h-8 w-auto"
                  />
                </a>
                
                <a 
                  href="https://auth.afip.gob.ar/contribuyente_/login.xhtml?action=SYSTEM&system=denuncias" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  title="AFIP - Data Fiscal"
                >
                  <img
                    src="/Data Fiscal.png"
                    alt="AFIP"
                    className="h-8 w-auto"
                  />
                </a>
                
                <a 
                  href="https://www.bcra.gob.ar/BCRAyVos/Usuarios_Financieros.asp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  title="Usuarios Financieros"
                >
                  <img
                    src="/usuarios financieros.jpg"
                    alt="Usuarios Financieros"
                    className="h-8 w-auto"
                  />
                </a>
              </div>
            </div>

            {/* Legal Text - Compacted */}
            <div className="mt-6 pt-4 border-t border-gray-300">
              <p className="text-gray-500 text-xs leading-tight font-sans text-center">
                TNA varía según perfil crediticio (min: 50%, máx: 120%). TEA (min: 62.14%, máx: 177.10%). CFT con IVA (min: 75.19%, máx: 214.29%). Plazos: 3-60 meses. Ejemplo: $8M a 24 meses, TNA 50%, cuota $582.119. © 2025 Crediexpress Automotor.
              </p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
