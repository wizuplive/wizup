import React from 'react';
import { motion } from 'framer-motion';

const TheTruth: React.FC = () => {
  const lineTransition = { duration: 1.5, ease: [0.16, 1, 0.3, 1] };

  return (
    <section className="py-[30rem] bg-black flex flex-col items-center text-center px-6 relative overflow-hidden">
      <div className="w-[1px] h-96 bg-gradient-to-b from-transparent via-white/10 to-transparent absolute top-0 left-1/2 -translate-x-1/2" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="mb-[20rem]">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.1 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={lineTransition}
            className="text-[9px] font-black text-white uppercase tracking-[1em] mb-24 block"
          >
            A Simple Truth
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ ...lineTransition, delay: 0.2 }}
            className="text-5xl md:text-[8rem] lg:text-[10rem] font-bold text-white leading-[0.82] tracking-tighter text-balance"
          >
            Communities<br /> 
            <span className="text-white/10">didn't fail.</span><br />
            The platforms<br />
            <span className="italic font-light text-white">did.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.2 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ ...lineTransition, delay: 0.6 }}
            className="mt-20 text-xl md:text-2xl text-white font-light tracking-tight italic"
          >
            We were taught to scroll. We forgot how to belong.
          </motion.p>
        </div>

        <div className="space-y-[30rem]">
          <div className="space-y-24">
            <motion.h3 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-25%" }}
              transition={{ duration: 1.2 }}
              className="text-4xl md:text-[6rem] lg:text-[8rem] text-white font-bold tracking-tighter leading-[0.85]"
            >
              Attention<br /> 
              <span className="text-white/5">was taken.</span>
            </motion.h3>
            <motion.h3 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-25%" }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="text-4xl md:text-[6rem] lg:text-[8rem] text-white font-bold tracking-tighter leading-[0.85]"
            >
              Belonging<br />
              <span className="text-white/20">faded.</span>
            </motion.h3>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            {["Streams vanish.", "Algorithms reward noise.", "Relationships are reset every day."].map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.2 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: i * 0.2 }}
                className="text-xl md:text-3xl text-white font-light tracking-tight"
              >
                {line}
              </motion.p>
            ))}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              viewport={{ once: true }}
              transition={{ duration: 2, delay: 1 }}
              className="pt-24 text-sm md:text-base text-white/60 font-bold uppercase tracking-[0.8em]"
            >
              WIZUP is the home for what remains.
            </motion.p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
    </section>
  );
};

export default TheTruth;