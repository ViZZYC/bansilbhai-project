import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./App.css";

import {
  FaPython, FaJava, FaRobot, FaBrain, FaBolt,
  FaGithub, FaLinkedin, FaExternalLinkAlt,
  FaProjectDiagram, FaChartBar, FaChartLine, FaLink,
  FaMicrosoft, FaHandPaper
} from "react-icons/fa";
import {
  SiNumpy, SiPandas, SiScikitlearn, SiFastapi,
  SiTensorflow, SiOpencv, SiPostgresql, SiMysql,
  SiMongodb, SiPycharm, SiJupyter, SiC
} from "react-icons/si";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

// ─── SCROLL REVEAL HOOK ───────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

// ─── FLOATING TECH BALLS ─────────────────────────────────────────────────────
function TechBallsCanvas({ techs }) {
  const mountRef = useRef(null);
  const iconsRef = useRef([]);

  useEffect(() => {
    const mount = mountRef.current;
    const W = mount.clientWidth, H = mount.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
    camera.position.z = 9;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pLight = new THREE.PointLight(0x915eff, 4, 30);
    pLight.position.set(5, 5, 5);
    scene.add(pLight);

    const balls = [];
    const colors = [0x915eff, 0xff6584, 0x43d9ad, 0xffd700, 0x4facfe, 0xf093fb, 0x00f2fe, 0x43e97b];
    techs.forEach((_, i) => {
      const angle = (i / techs.length) * Math.PI * 2;
      const geo = new THREE.IcosahedronGeometry(0.5, 1);
      const mat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length], metalness: 0.8, roughness: 0.2,
        wireframe: true, transparent: true, opacity: 0.9
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(Math.cos(angle) * 3.2, Math.sin(angle) * 4 * 0.5, Math.sin(angle) * 0.5);
      balls.push({ mesh, angle, baseY: mesh.position.y });
      scene.add(mesh);
    });

    let frameId;
    const clock = new THREE.Clock();
    const vector = new THREE.Vector3();
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      balls.forEach((b, i) => {
        const a = b.angle + t * 0.2;
        b.mesh.position.x = Math.cos(a) * 4;
        b.mesh.position.z = Math.sin(a) * 4;
        b.mesh.position.y = b.baseY + Math.sin(t * 1.5 + i) * 0.3;
        b.mesh.rotation.x = t * 0.5 + i;
        b.mesh.rotation.y = t * 0.3 + i;
        vector.copy(b.mesh.position).project(camera);
        const x = (vector.x * 0.5 + 0.5) * mount.clientWidth;
        const y = (vector.y * -0.5 + 0.5) * mount.clientHeight;
        const scale = Math.max(0.3, 1 - vector.z * 0.5);
        const opacity = vector.z > 1 ? 0.9 : 1;
        if (iconsRef.current[i]) {
          iconsRef.current[i].style.transform = `translate(-50%,-50%) translate(${x}px,${y}px) scale(${scale})`;
          iconsRef.current[i].style.zIndex = Math.round((1 - vector.z) * 100);
          iconsRef.current[i].style.opacity = opacity;
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [techs]);

  return (
    <div className="techballs-canvas" style={{ position: 'relative', overflow: 'visible', width: '100%', height: '100%', minHeight: '500px' }}>
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {techs.map((t, i) => (
          <div key={t.name} ref={el => iconsRef.current[i] = el} title={t.name}
            style={{
              position: 'absolute', top: 0, left: 0, fontSize: '1.8rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '55px', height: '55px',
              background: 'rgba(21,16,48,0.5)', backdropFilter: 'blur(5px)',
              border: '1px solid rgba(145,94,255,0.3)', borderRadius: '50%',
              boxShadow: '0 0 15px rgba(145,94,255,0.2)', willChange: 'transform,opacity',
              transition: 'opacity 0.2s ease-out',
            }}>
            {t.icon}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AI ROBOT CANVAS ─────────────────────────────────────────────────────────
function AIRobotCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth || 500;
    const H = mount.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
    camera.position.set(0, 1, 7);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const purpleLight = new THREE.PointLight(0x915eff, 6, 20);
    purpleLight.position.set(3, 3, 4);
    scene.add(purpleLight);
    const blueLight = new THREE.PointLight(0x4facfe, 3, 15);
    blueLight.position.set(-3, -1, 3);
    scene.add(blueLight);
    const rimLight = new THREE.PointLight(0xffffff, 1.5, 10);
    rimLight.position.set(0, 5, -3);
    scene.add(rimLight);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    let robotModel;
    let mixer;
    const clock = new THREE.Clock();

    loader.load(
      "/ai_robot/scene.gltf",
      (gltf) => {
        robotModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(robotModel);
        const center = box.getCenter(new THREE.Vector3());
        robotModel.position.sub(center);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4.0 / maxDim;
        robotModel.scale.setScalar(scale);
        robotModel.position.y = -0.5;
        scene.add(robotModel);
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(robotModel);
          mixer.clipAction(gltf.animations[0]).play();
        }
      },
      undefined,
      (error) => console.error("Robot GLTF Error:", error)
    );

    const particleCount = 80;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.0 + Math.random() * 1.2;
      particlePositions[i * 3]     = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 3;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
      color: 0x915eff, size: 0.05, transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    scene.add(particles);

    const ringPos = [];
    for (let i = 0; i < 300; i++) {
      const a = (i / 300) * Math.PI * 2;
      ringPos.push(Math.cos(a) * 2.5, 0, Math.sin(a) * 2.5);
    }
    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ringPos), 3));
    const ring = new THREE.Points(ringGeo, new THREE.PointsMaterial({
      color: 0x915eff, size: 0.05, transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    ring.rotation.x = Math.PI / 5;
    ring.position.y = -0.5;
    scene.add(ring);

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      if (mixer) mixer.update(delta);
      if (robotModel) {
        robotModel.rotation.y = elapsed * 0.4;
        robotModel.position.y = -0.5 + Math.sin(elapsed * 1.2) * 0.12;
      }
      ring.position.y = -0.5 + Math.sin(elapsed * 1.2) * 0.12;
      ring.rotation.y = elapsed * 0.3;
      particles.rotation.y = elapsed * 0.15;
      purpleLight.intensity = 5 + Math.sin(elapsed * 2) * 1.5;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (mount && mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={mountRef} style={{
      width: '100%', height: '100%', minHeight: '100%',
      position: 'relative', overflow: 'hidden',
    }} />
  );
}

// ─── STARS BACKGROUND ────────────────────────────────────────────────────────
function StarsBackground() {
  const mountRef = useRef(null);
  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 1;
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const canvas = renderer.domElement;
    canvas.style.position = 'fixed';
    canvas.style.top = '0'; canvas.style.left = '0';
    canvas.style.width = '100vw'; canvas.style.height = '100vh';
    canvas.style.zIndex = '0'; canvas.style.pointerEvents = 'none';
    mount.appendChild(canvas);

    const count = 5000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 100;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.7 })));

    let frameId;
    const animate = () => { frameId = requestAnimationFrame(animate); renderer.render(scene, camera); };
    animate();

    const handleScroll = () => { camera.position.y = window.scrollY * -0.002; };
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (mount.contains(canvas)) mount.removeChild(canvas);
      renderer.dispose();
    };
  }, []);
  return (
    <div ref={mountRef} style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      zIndex: 0, pointerEvents: 'none',
      backgroundColor: '#050816',
    }} />
  );
}

// ─── DATA ────────────────────────────────────────────────────────────────────
const techs = [
  { name: "Python",       icon: <FaPython color="#3776AB" /> },
  { name: "Java",         icon: <FaJava color="#007396" /> },
  { name: "C",            icon: <SiC color="#A8B9CC" /> },
  { name: "NumPy",        icon: <SiNumpy color="#013243" /> },
  { name: "Pandas",       icon: <SiPandas color="#150458" /> },
  { name: "Scikit-learn", icon: <SiScikitlearn color="#F7931E" /> },
  { name: "Matplotlib",   icon: <FaChartBar color="#11557c" /> },
  { name: "Seaborn",      icon: <FaChartLine color="#4C72B0" /> },
  { name: "LangChain",    icon: <FaLink color="#ffffff" /> },
  { name: "LangGraph",    icon: <FaProjectDiagram color="#ffffff" /> },
  { name: "FastAPI",      icon: <SiFastapi color="#009688" /> },
  { name: "TensorFlow",   icon: <SiTensorflow color="#FF6F00" /> },
  { name: "OpenCV",       icon: <SiOpencv color="#5C3EE8" /> },
  { name: "Mediapipe",    icon: <FaHandPaper color="#00A2D3" /> },
  { name: "PostgreSQL",   icon: <SiPostgresql color="#336791" /> },
  { name: "MySQL",        icon: <SiMysql color="#4479A1" /> },
  { name: "MongoDB",      icon: <SiMongodb color="#47A248" /> },
  { name: "MS Office",    icon: <FaMicrosoft color="#D83B01" /> },
  { name: "PyCharm",      icon: <SiPycharm color="#ffffff" /> },
  { name: "Jupyter Lab",  icon: <SiJupyter color="#F37626" /> },
];

const experiences = [
  {
    title: "AI Engineer Intern", company: "Skyline Infosys",
    date: "Jan 2025 — May 2025", icon: <FaRobot size="1.2rem" color="#fff" />, color: "#2563eb",
    points: ["Gaining hands-on experience with various AI technologies, including data preprocessing, model optimization, and algorithm selection."],
  },
  {
    title: "AI/ML Engineer", company: "Kukami Technology",
    date: "June 2025 — Present", icon: <FaBrain size="1.2rem" color="#fff" />, color: "#7c3aed",
    points: [
      "Developed and maintained backend systems for multiple AI-driven applications including AI Math Tutor, Document Summarizer, Resume Analyzer, Interview Assistant, PPT Generator, and Graph Generator using FastAPI and scalable API architectures.",
      "Designed and deployed ML models and LLM integrations for NLP tasks such as text summarization, question generation, similarity matching, and structured content generation.",
      "Built a Sales Forecasting model using machine learning techniques to analyze historical sales data, perform trend analysis, and generate predictive insights to support business decision-making.",
      "Optimized API performance, implemented efficient data pipelines, and ensured seamless integration of AI models into production environments with scalable and maintainable system design.",
    ],
  },
];

const projects = [
  { name: "AI Math Tutor", desc: "AI-powered mathematics tutor backend with step-by-step problem solving, conversational tutoring, and Scan & Solve functionality using LLMs.", tags: ["FastAPI","PostgreSQL","LLM","Socket.IO"], img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop" },
  { name: "AI PPT Generator", desc: "AI-driven PowerPoint Generator that dynamically creates presentation content and customizable PPTX files using LLMs and FastAPI.", tags: ["FastAPI","LLM","LibreOffice","ImageMagick"], img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop" },
  { name: "AI Resume Analyzer & Interview", desc: "AI-powered Resume Analyzer and Interview Bot with ATS scoring, JD matching, interview evaluation, and automated PDF report generation.", tags: ["FastAPI","Redis","Jinja2","wkhtmltopdf"], img: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop" },
  { name: "Voice Email Agent", desc: "Voice-controlled email system that enables users to send emails using spoken commands with secure authentication.", tags: ["Python","Speech Recognition","SMTP"], img: "https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=800&auto=format&fit=crop" },
  { name: "AI Document Summarizer & QnA", desc: "Document analysis and Q&A platform supporting PDF, DOCX, and TXT uploads with intelligent summaries and question answering.", tags: ["LangChain","LLM","React","FastAPI"], img: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?q=80&w=800&auto=format&fit=crop" },
  { name: "Hands-Free Virtual Mouse", desc: "Virtual mouse system using MediaPipe and OpenCV for hand tracking, gesture controls, clicks, drag & drop, and screenshots.", tags: ["OpenCV","MediaPipe","PyAutoGUI"], img: "https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=800&auto=format&fit=crop" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function Section({ id, children, className = "" }) {
  return (
    <section id={id} className={`section ${className}`}>
      <div className="container">{children}</div>
    </section>
  );
}

function SectionTitle({ sub, title }) {
  return (
    <div className="section-title">
      <p className="section-sub reveal reveal--up">{sub}</p>
      <h2 className="section-heading reveal reveal--up reveal--d1">{title}</h2>
    </div>
  );
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = ["about", "work", "projects", "contact"];
  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__inner">
        <a href="#" className="navbar__logo">
          <span className="logo-dot" />
          Bansil <span className="logo-accent">| AI & ML Developer</span>
        </a>
        <ul className="navbar__links">
          {links.map(l => <li key={l}><a href={`#${l}`} className="navbar__link">{l}</a></li>)}
        </ul>
        <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Menu">
          <span className={`ham-bar ${open ? "open" : ""}`} />
          <span className={`ham-bar ${open ? "open" : ""}`} />
          <span className={`ham-bar ${open ? "open" : ""}`} />
        </button>
      </div>
      {open && (
        <div className="mobile-menu">
          {links.map(l => <a key={l} href={`#${l}`} className="mobile-link" onClick={() => setOpen(false)}>{l}</a>)}
        </div>
      )}
    </nav>
  );
}

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="hero" id="hero">
      <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '420px', height: '420px', background: 'radial-gradient(circle, rgba(145,94,255,0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: '-60px', right: '28%', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(145,94,255,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />

      <div className="hero__text-block">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '12px', flexShrink: 0 }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#915eff', boxShadow: '0 0 10px rgba(145,94,255,0.8), 0 0 20px rgba(145,94,255,0.4)', animation: 'heroDotPulse 2.5s ease-in-out infinite' }} />
          <div style={{ width: '3px', height: '240px', marginTop: '6px', borderRadius: '2px', background: 'linear-gradient(to bottom, #915eff 0%, rgba(145,94,255,0.3) 60%, transparent 100%)' }} />
        </div>
        <div>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', color: '#915eff', letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 14px', opacity: 0.85, animation: 'heroFadeUp 0.6s ease both' }}>// portfolio</p>
          <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, color: '#fff', margin: '0 0 6px', lineHeight: 1.1, letterSpacing: '-1.5px', animation: 'heroFadeUp 0.7s ease 0.1s both' }}>
            Hi, I'm{' '}
            <span style={{ color: '#915eff', position: 'relative', display: 'inline-block' }}>
              Bansil
              <span style={{ position: 'absolute', bottom: '2px', left: 0, width: '100%', height: '4px', background: 'linear-gradient(to right, #915eff, transparent)', borderRadius: '2px' }} />
            </span>
          </h1>
          <p style={{ fontFamily: "'Nunito', sans-serif", marginTop: '18px', fontSize: '1.15rem', maxWidth: '440px', lineHeight: 1.8, color: '#aaa6c3', fontWeight: 400, animation: 'heroFadeUp 0.8s ease 0.2s both' }}>
            I develop intelligent AI solutions,<br />scalable systems &amp; modern user interfaces.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '24px', animation: 'heroFadeUp 0.9s ease 0.3s both' }}>
            {['AI / ML', 'AI Engineer', 'Backend Developer'].map(tag => (
              <span key={tag} style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#915eff', border: '1px solid rgba(145,94,255,0.35)', background: 'rgba(145,94,255,0.07)', padding: '6px 16px', borderRadius: '20px', letterSpacing: '0.5px', fontWeight: 700 }}>{tag}</span>
            ))}
          </div>
          <div style={{ marginTop: '35px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', animation: 'heroFadeUp 1s ease 0.4s both' }}>
            <a href="#projects" style={{ background: '#915eff', color: '#fff', padding: '14px 30px', borderRadius: '10px', fontFamily: "'Nunito', sans-serif", fontSize: '15px', fontWeight: 700, textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s ease', boxShadow: '0 4px 15px rgba(145,94,255,0.2)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(145,94,255,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(145,94,255,0.2)'; }}>View Work ↗</a>
            <a href="#contact" style={{ background: 'transparent', color: '#aaa6c3', border: '1.5px solid rgba(255,255,255,0.15)', padding: '13px 28px', borderRadius: '10px', fontFamily: "'Nunito', sans-serif", fontSize: '15px', fontWeight: 600, textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#915eff'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(145,94,255,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#aaa6c3'; e.currentTarget.style.background = 'transparent'; }}>Contact</a>
          </div>
        </div>
      </div>

      <div className="hero__video-block">
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{ position: 'absolute', inset: '-20px', border: '1px solid rgba(145,94,255,0.18)', borderRadius: '18px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: '-38px', border: '1px solid rgba(145,94,255,0.07)', borderRadius: '26px', pointerEvents: 'none' }} />
          {[
            { top: '-20px', left: '-20px', borderWidth: '2px 0 0 2px', borderRadius: '4px 0 0 0' },
            { top: '-20px', right: '-20px', borderWidth: '2px 2px 0 0', borderRadius: '0 4px 0 0' },
            { bottom: '-20px', left: '-20px', borderWidth: '0 0 2px 2px', borderRadius: '0 0 0 4px' },
            { bottom: '-20px', right: '-20px', borderWidth: '0 2px 2px 0', borderRadius: '0 0 4px 0' },
          ].map((s, i) => (
            <div key={i} style={{ position: 'absolute', width: '18px', height: '18px', borderColor: '#915eff', borderStyle: 'solid', opacity: 0.7, ...s }} />
          ))}
          <video src="/jarvis-blue.mp4" autoPlay loop muted playsInline
            style={{ width: '100%', height: 'auto', display: 'block', mixBlendMode: 'screen', opacity: 0.88 }} />
        </div>
      </div>

      <a href="#about" style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
        <div style={{ width: '26px', height: '42px', border: '2px solid rgba(255,255,255,0.25)', borderRadius: '13px', display: 'flex', justifyContent: 'center', paddingTop: '7px' }}>
          <div style={{ width: '4px', height: '7px', background: 'rgba(255,255,255,0.55)', borderRadius: '2px', animation: 'heroScrollWheel 1.8s ease-in-out infinite' }} />
        </div>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase' }}>scroll</span>
      </a>

      <style>{`
        @keyframes heroDotPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(145,94,255,0.8), 0 0 20px rgba(145,94,255,0.4); }
          50%       { box-shadow: 0 0 14px rgba(145,94,255,1), 0 0 30px rgba(145,94,255,0.6); }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroScrollWheel {
          0%   { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
        .hero__text-block {
          position: relative; z-index: 10; flex: 1;
          padding: 0 0 0 6%; display: flex; align-items: flex-start; gap: 22px;
        }
        .hero__video-block {
          position: relative; z-index: 5; flex: 0 0 44%; max-width: 580px;
          display: flex; align-items: center; justify-content: center; padding: 40px 5% 40px 0;
        }
        @media (max-width: 768px) {
          #hero { flex-direction: column !important; padding-top: 90px !important; padding-bottom: 60px !important; min-height: auto !important; gap: 40px !important; }
          .hero__text-block { padding: 0 20px !important; width: 100% !important; }
          .hero__video-block { flex: unset !important; width: 85% !important; max-width: 340px !important; padding: 20px 0 !important; margin: 0 auto !important; }
          .section { padding: 40px 0 !important; }
          .container { padding: 0 16px !important; }
          .about__grid { grid-template-columns: 1fr !important; }
          .about__cards { grid-template-columns: 1fr !important; }
          .tech__layout { flex-direction: column !important; }
          .tech__left { width: 100% !important; }
          .techballs-canvas { min-height: 360px !important; }
          .timeline { padding-left: 20px !important; }
          .timeline__item { flex-direction: column !important; gap: 12px !important; }
          .timeline__dot { margin-left: 0 !important; }
          .projects__grid { grid-template-columns: 1fr !important; }
          .footer-top { flex-direction: column !important; align-items: flex-start !important; }
          .logo-accent { display: none; }
        }
        @media (max-width: 480px) {
          .section-heading { font-size: 1.8rem !important; }
          .about__text { font-size: 0.95rem !important; }
          .project-card__name { font-size: 1.1rem !important; }
          .techballs-canvas { min-height: 280px !important; }
        }
      `}</style>
    </section>
  );
}

// ─── ABOUT ───────────────────────────────────────────────────────────────────
function About() {
  const cards = [
    { icon: <FaRobot size="2rem" color="#915eff" />, title: "AI/ML Developer", desc: "I build intelligent applications using AI, Machine Learning, and modern web technologies." },
    { icon: <FaBrain size="2rem" color="#915eff" />, title: "Generative AI", desc: "I create AI-powered experiences with LLMs, automation, and smart assistants." },
    { icon: <FaBolt size="2rem" color="#915eff" />, title: "Fast & Scalable", desc: "I develop scalable, high-performance applications with clean architecture and modern tools." },
  ];
  return (
    <Section id="about">
      <SectionTitle sub="Introduction" title="Overview." />
      <div className="about__grid">
        <p className="about__text reveal reveal--left">
          I'm an AI/ML developer passionate about building intelligent and user-friendly applications using modern technologies. I work with React, JavaScript, Python, Machine Learning, and Generative AI tools to create smart solutions that solve real-world problems.{" "}
          <span className="gradient-text">Let's build innovative AI-powered experiences together!</span>
        </p>
        <div className="about__cards">
          {cards.map((c, i) => (
            <div className={`about-card reveal reveal--right reveal--d${i + 1}`} key={c.title}>
              <div style={{ marginBottom: "10px" }}>{c.icon}</div>
              <h3 className="about-card__title">{c.title}</h3>
              <p className="about-card__desc">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── TECH ─────────────────────────────────────────────────────────────────────
function Tech() {
  return (
    <Section id="tech">
      <div className="tech__layout">
        <div className="tech__left">
          <SectionTitle sub="Technologies" title="What I Use." />
          <div className="tech__chips">
            {techs.map((t, i) => (
              <div className={`tech-chip reveal reveal--up reveal--d${(i % 5) + 1}`} key={t.name}>
                <span style={{ fontSize: "1.2rem", display: "flex", alignItems: "center" }}>{t.icon}</span> {t.name}
              </div>
            ))}
          </div>
        </div>
       <div className="reveal reveal--right" style={{ flex: 1, minHeight: '500px', width: '100%' }}>
          <TechBallsCanvas techs={techs} />
        </div>
      </div>
    </Section>
  );
}

// ─── EXPERIENCE ───────────────────────────────────────────────────────────────
function Experience() {
  return (
    <Section id="work">
      <SectionTitle sub="What I've done so far" title="Work Experience." />
      <div className="timeline">
        {experiences.map((exp, i) => (
          <div className={`timeline__item reveal reveal--left reveal--d${i + 1}`} key={exp.company}>
            <div className="timeline__dot" style={{ background: exp.color }}>{exp.icon}</div>
            <div className="timeline__card">
              <h3 className="timeline__title">{exp.title}</h3>
              <p className="timeline__company" style={{ color: exp.color }}>{exp.company}</p>
              <p className="timeline__date">{exp.date}</p>
              <ul className="timeline__points">
                {exp.points.map((p, j) => <li key={j}>{p}</li>)}
              </ul>
            </div>
          </div>
        ))}
        <div className="timeline__line" />
      </div>
    </Section>
  );
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
function Projects() {
  return (
    <Section id="projects">
      <SectionTitle sub="My Work" title="Projects." />
      <div className="projects__grid">
        {projects.map((p, i) => (
          <div className={`project-card reveal reveal--up reveal--d${(i % 3) + 1}`} key={p.name}>
            <div style={{ width: "100%", height: "200px", borderRadius: "12px", overflow: "hidden", position: "relative", marginBottom: "1rem" }}>
              <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "10px" }}>
                <a href="#" className="project-link" aria-label="GitHub"><FaGithub size={18} /></a>
                <a href="#" className="project-link" aria-label="External link"><FaExternalLinkAlt size={16} /></a>
              </div>
            </div>
            <h3 className="project-card__name">{p.name}</h3>
            <p className="project-card__desc">{p.desc}</p>
            <div className="project-card__tags">
              {p.tags.map(t => <span key={t} className="tag">#{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── CONTACT ─────────────────────────────────────────────────────────────────
function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const socials = [
    { name: "LinkedIn", icon: <FaLinkedin />, href: "https://www.linkedin.com/in/bansil-khokhar-325759294" },
    { name: "GitHub", icon: <FaGithub />, href: "https://github.com/BansilKhokhar95" },
  ];

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`New Project Inquiry from ${form.name}`);
    const body = encodeURIComponent(`Hi Bansil,\n\nI am ${form.name}.\nMy Email: ${form.email}\n\nMessage Details:\n${form.message}`);
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=bansilkhokhar95@gmail.com&cc=${form.email}&su=${subject}&body=${body}`;
    window.open(gmailLink, '_blank');
    setSent(true);
    setTimeout(() => { setSent(false); setForm({ name: "", email: "", message: "" }); }, 4000);
  };

  return (
    <Section id="contact">
      <SectionTitle sub="Get in touch" title="Contact." />

      <div style={{ marginBottom: "2rem" }}>
        <h3 className="contact__heading reveal reveal--up">Let's work together.</h3>
        <p className="contact__sub reveal reveal--up reveal--d1">
          Whether you have a project idea, want to collaborate, or just want to say hi — my inbox is always open.
        </p>
        <div className="reveal reveal--up reveal--d2" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {socials.map(s => (
            <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="social-pill">
              <span style={{ fontSize: "1.1rem" }}>{s.icon}</span> {s.name}
            </a>
          ))}
        </div>
      </div>

      <div className="contact__layout">
        <form className="contact__form reveal reveal--left" onSubmit={handleSubmit}>
          <label className="form-label">Your Name</label>
          <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="What's your name?" required />
          <label className="form-label">Your Email</label>
          <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="What's your email?" required />
          <label className="form-label">Your Message</label>
          <textarea className="form-input form-textarea" name="message" value={form.message} onChange={handleChange} placeholder="What do you want to say?" rows={5} required />
          <button type="submit" className="form-btn">
            {sent ? "✅ Opening Gmail..." : "Send Message →"}
          </button>
        </form>

        <div className="contact__robot-wrapper reveal reveal--right">
          <AIRobotCanvas />
        </div>
      </div>
    </Section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  const socials = [
    { name: "LinkedIn", icon: <FaLinkedin />, href: "https://www.linkedin.com/in/bansil-khokhar-325759294" },
    { name: "GitHub", icon: <FaGithub />, href: "https://github.com/BansilKhokhar95" },
  ];
  const stack = ["Pandas", "Java", "FastAPI", "Python", "LangChain"];

  return (
    <footer style={{ width: "100%", padding: "60px 20px 30px", background: "transparent", borderTop: "1px solid rgba(145,94,255,0.2)", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="footer-top" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem", marginBottom: "2.5rem" }}>

          <div className="reveal reveal--up">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.7rem" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#915eff", boxShadow: "0 0 12px #915eff" }} />
              <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f3f4f8" }}>Bansil</span>
              <span style={{ color: "#8892b0", fontSize: "0.85rem" }}>| AI & ML Developer</span>
            </div>
            <p style={{ color: "#8892b0", fontSize: "0.85rem", maxWidth: "260px", lineHeight: 1.7 }}>
              Building intelligent AI-powered applications with clean architecture and modern tech.
            </p>
          </div>

          <div className="reveal reveal--up reveal--d1">
            <p style={{ fontFamily: "Space Mono, monospace", fontSize: "0.7rem", color: "#8892b0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>Connect</p>
            <div style={{ display: "flex", gap: "12px" }}>
              {socials.map(s => (
                <a key={s.name} href={s.href} aria-label={s.name} style={{ width: "42px", height: "42px", borderRadius: "50%", border: "1px solid rgba(145,94,255,0.3)", background: "rgba(21,16,48,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", color: "#8892b0", transition: "all 0.3s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#915eff"; e.currentTarget.style.color = "#915eff"; e.currentTarget.style.boxShadow = "0 0 16px rgba(145,94,255,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(145,94,255,0.3)"; e.currentTarget.style.color = "#8892b0"; e.currentTarget.style.boxShadow = "none"; }}
                >{s.icon}</a>
              ))}
            </div>
          </div>

          <div className="reveal reveal--up reveal--d2">
            <p style={{ fontFamily: "Space Mono, monospace", fontSize: "0.7rem", color: "#8892b0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>Navigate</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {["about", "work", "projects", "contact"].map(l => (
                <a key={l} href={`#${l}`} style={{ color: "#8892b0", fontSize: "0.85rem", fontFamily: "Space Mono, monospace", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#915eff"}
                  onMouseLeave={e => e.currentTarget.style.color = "#8892b0"}
                >→ {l}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="reveal reveal--up reveal--d3" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "2.5rem", justifyContent: "center" }}>
          {stack.map(t => (
            <span key={t} style={{ fontFamily: "Space Mono, monospace", fontSize: "0.72rem", color: "#bf9bff", background: "rgba(145,94,255,0.1)", border: "1px solid rgba(145,94,255,0.25)", borderRadius: "100px", padding: "0.3rem 0.9rem" }}>#{t}</span>
          ))}
        </div>

        <div className="reveal reveal--fade reveal--d4" style={{ borderTop: "1px solid rgba(145,94,255,0.1)", paddingTop: "1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <p style={{ color: "#8892b0", fontSize: "0.8rem", fontFamily: "Space Mono, monospace" }}>© 2026 Bansil. Engineering the Future with AI</p>
          <a href="#hero" style={{ color: "#8892b0", fontSize: "0.8rem", fontFamily: "Space Mono, monospace", padding: "8px 16px", border: "1px solid rgba(145,94,255,0.2)", borderRadius: "8px", transition: "all 0.3s ease" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#915eff"; e.currentTarget.style.borderColor = "#915eff"; e.currentTarget.style.background = "rgba(145,94,255,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#8892b0"; e.currentTarget.style.borderColor = "rgba(145,94,255,0.2)"; e.currentTarget.style.background = "transparent"; }}
          >Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  useScrollReveal();

  return (
    <div className="app">
      <StarsBackground />
      <Navbar />
      <Hero />
      <About />
      <Tech />
      <Experience />
      <Projects />
      <Contact />
      <Footer />
    </div>
  );
}