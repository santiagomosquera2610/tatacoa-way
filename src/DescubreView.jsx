import { motion } from 'motion/react';
import { HISTORIA_TATACOA } from './HistoriaData';

export function DescubreView() {
  return (
    <div className="h-full overflow-y-auto bg-[#FDFBF7] scrollbar-hide pb-32">
      
      {/* Header Interactivo */}
      <div className="relative w-full h-[45vh] flex items-end justify-start p-8 mb-8 overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1541285227702-8a9d18c3b526?auto=format&fit=crop&w=800&q=80" 
          alt="Desierto Tatacoa"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/40 to-transparent"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 w-full"
        >
          <span className="text-white uppercase tracking-[0.2em] font-black text-[10px] bg-desert-red/90 px-3 py-1 rounded-full inline-block mb-3 shadow-md">
            Patrimonio Natural
          </span>
          <h2 className="text-4xl font-black text-desert-night leading-none tracking-tight mb-2">
            El Valle de <br/> las Tristezas
          </h2>
          <p className="text-desert-stone font-medium text-sm max-w-[280px]">
            Descubre los secretos que oculta el segundo territorio árido más grande de Colombia.
          </p>
        </motion.div>
      </div>

      {/* Timeline Section */}
      <div className="px-6 relative">
        {/* Línea de tiempo vertical */}
        <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-desert-sand/60 rounded-full"></div>

        <div className="flex flex-col gap-12">
          {HISTORIA_TATACOA.map((evento, index) => (
            <motion.div 
              key={evento.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative pl-12"
            >
              {/* Nodo del Timeline */}
              <div className="absolute left-[-5px] top-1.5 w-3.5 h-3.5 rounded-full bg-desert-earth ring-4 ring-[#FDFBF7] z-10 shadow-sm"></div>
              
              <div className="flex flex-col gap-3">
                <span className="text-xs font-black uppercase tracking-wider text-desert-stone">
                  {evento.epoca}
                </span>
                
                <div className={`rounded-3xl overflow-hidden shadow-desert-md border border-black/5 ${evento.bg}`}>
                  <div className="h-32 w-full relative">
                    <img src={evento.imgUrl} alt={evento.titulo} className="w-full h-full object-cover" />
                    {evento.dark && <div className="absolute inset-0 bg-black/40"></div>}
                  </div>
                  <div className="p-5">
                    <h3 className={`text-xl font-black mb-2 ${evento.dark ? 'text-white' : 'text-desert-night'}`}>
                      {evento.titulo}
                    </h3>
                    <p className={`text-sm leading-relaxed font-medium ${evento.dark ? 'text-white/80' : 'text-desert-stone'}`}>
                      {evento.texto}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

    </div>
  );
}
