import React, { useEffect, useRef, useState } from 'react';

export default function Doodle(){
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(()=>{
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    let last = null;
    function pos(e){
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function onDown(e){ setIsDrawing(true); last = pos(e); }
    function onUp(){ setIsDrawing(false); last = null; }
    function onMove(e){ if(!isDrawing || !last) return; const p = pos(e); ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke(); last = p; }

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('mousemove', onMove);

    return ()=>{
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('mousemove', onMove);
    };
  },[isDrawing]);

  function clear(){
    const c = canvasRef.current;
    if (!c) return; const ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
  }

  return (
    <section id="doodle" className="doodle">
      <h1>Doodle Board</h1>
      <p className="section-subtitle">A blank space to doodle and take your mind elsewhere.</p>
      <canvas id="doodleCanvas" ref={canvasRef} width={800} height={400} />
      <button id="clearBtn" onClick={clear}>Clear Board</button>
    </section>
  );
}
