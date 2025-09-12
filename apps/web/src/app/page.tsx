import Image from "next/image";
import Link from "next/link";
import ContactForm from "@/components/landing/ContactForm";

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
        <section id="contacto" className="scroll-mt-20 md:scroll-mt-24 lg:scroll-mt-32 pt-12 md:pt-16 lg:pt-24 xl:pt-32 pb-12 md:pb-16 lg:pb-20">
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
      </div>

      {/* Footer */}
      <footer className="bg-white py-8 md:py-12 lg:py-16 border-t border-gray-100">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Footer Content */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-12">
              
              {/* Logo Section */}
              <div className="flex-shrink-0">
                <img
                  src="/recurso-15.svg"
                  alt="Crediexpress Automotor"
                  className="h-auto w-[200px] md:w-[240px] lg:w-[280px]"
                />
              </div>

              {/* Institutional Links */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-8">
                <a 
                  href="https://www.bcra.gob.ar/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img
                    src="/Banco Central.png"
                    alt="Banco Central de la República Argentina"
                    className="h-12 md:h-14 lg:h-16 w-auto"
                  />
                </a>
                
                <a 
                  href="https://www.argentina.gob.ar/aaip/datospersonales/reclama" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img
                    src="/Base de datos.jpg"
                    alt="Protección de Datos Personales"
                    className="h-12 md:h-14 lg:h-16 w-auto"
                  />
                </a>
                
                <a 
                  href="https://auth.afip.gob.ar/contribuyente_/login.xhtml?action=SYSTEM&system=denuncias" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img
                    src="/Data Fiscal.png"
                    alt="AFIP - Data Fiscal"
                    className="h-12 md:h-14 lg:h-16 w-auto"
                  />
                </a>
                
                <a 
                  href="https://www.bcra.gob.ar/BCRAyVos/Usuarios_Financieros.asp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img
                    src="/usuarios financieros.jpg"
                    alt="Usuarios Financieros - BCRA"
                    className="h-12 md:h-14 lg:h-16 w-auto"
                  />
                </a>
              </div>
            </div>

            {/* Legal Text */}
            <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-gray-200">
              <p className="text-gray-600 text-xs md:text-sm lg:text-base leading-relaxed font-sans font-normal">
                El período mínimo para la devolución de un préstamo es de 3 meses, siendo el máximo 60 meses. La TNA de un préstamo varía dependiendo del perfil crediticio del solicitante, siendo la mínima 50,0% y la máxima 120,0%. A su vez, la TEA mínima es de 62.14% siendo la máxima 177.10%. (CFT) con IVA: Mínimo: 75,19% - Máximo: 214.29% A modo de ejemplo Monto solicitado de $8.000.000 a 24 meses TNA (sin IVA): 50,0% - TEA (sin IVA): 62.14% - CFTEA (con IVA): 75.19% Cuota: $582.119,- Total a pagar: $13.970.856, -
              </p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
