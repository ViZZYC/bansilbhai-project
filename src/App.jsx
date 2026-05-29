import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import "./App.css";

import {
  FaPython, FaJava, FaRobot, FaBrain, FaBolt,
  FaGithub, FaLinkedin, FaExternalLinkAlt,
  FaProjectDiagram, FaChartBar, FaChartLine, FaLink,
  FaMicrosoft, FaHandPaper, FaArrowRight, FaDownload
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
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    const observe = () => {
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => observer.observe(el));
    };
    observe();

    const mutObs = new MutationObserver(observe);
    mutObs.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutObs.disconnect();
    };
  }, []);
}

// ─── TYPEWRITER HOOK ─────────────────────────────────────────────────────────
function useTypewriter(words, typingSpeed = 90, deletingSpeed = 50, pauseTime = 2200) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout;

    if (!isDeleting && text === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    } else {
      timeout = setTimeout(() => {
        setText(currentWord.substring(0, text.length + (isDeleting ? -1 : 1)));
      }, isDeleting ? deletingSpeed : typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [text, wordIndex, isDeleting, words, typingSpeed, deletingSpeed, pauseTime]);

  return text;
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
    camera.position.z = 10;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const pLight = new THREE.PointLight(0x00e5ff, 6, 35);
    pLight.position.set(5, 5, 5);
    scene.add(pLight);
    const pLight2 = new THREE.PointLight(0xa855f7, 5, 30);
    pLight2.position.set(-4, -3, 4);
    scene.add(pLight2);
    const pLight3 = new THREE.PointLight(0xf472b6, 3, 25);
    pLight3.position.set(0, 4, -3);
    scene.add(pLight3);

    const balls = [];
    const colors = [0x00e5ff, 0xa855f7, 0xf472b6, 0xfb923c, 0x34d399, 0x06b6d4, 0xc084fc, 0xf43f5e];
    techs.forEach((_, i) => {
      const angle = (i / techs.length) * Math.PI * 2;
      const geo = new THREE.IcosahedronGeometry(0.6, 1);
      const mat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length], metalness: 0.9, roughness: 0.1,
        wireframe: true, transparent: true, opacity: 0.92
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(Math.cos(angle) * 3.8, Math.sin(angle) * 3.5 * 0.5, Math.sin(angle) * 0.5);
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
        const a = b.angle + t * 0.18;
        b.mesh.position.x = Math.cos(a) * 5;
        b.mesh.position.z = Math.sin(a) * 5;
        b.mesh.position.y = b.baseY + Math.sin(t * 1.2 + i) * 0.35;
        b.mesh.rotation.x = t * 0.4 + i;
        b.mesh.rotation.y = t * 0.25 + i;
        vector.copy(b.mesh.position).project(camera);
        const x = (vector.x * 0.5 + 0.5) * mount.clientWidth;
        const y = (vector.y * -0.5 + 0.5) * mount.clientHeight;
        const scale = Math.max(0.35, 1 - vector.z * 0.4);
        const opacity = vector.z > 1 ? 0.85 : 1;
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
    <div className="techballs-canvas">
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {techs.map((t, i) => (
          <div key={t.name} ref={el => iconsRef.current[i] = el} title={t.name}
            style={{
              position: 'absolute', top: 0, left: 0, fontSize: '1.8rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '58px', height: '58px',
              background: 'rgba(6,6,17,0.75)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%',
              boxShadow: '0 4px 28px rgba(0,0,0,0.5), 0 0 12px rgba(0,229,255,0.06)',
              willChange: 'transform,opacity',
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
    const cyanLight = new THREE.PointLight(0x00e5ff, 6, 20);
    cyanLight.position.set(3, 3, 4);
    scene.add(cyanLight);
    const purpleLight = new THREE.PointLight(0xa855f7, 4, 15);
    purpleLight.position.set(-3, -1, 3);
    scene.add(purpleLight);
    const pinkLight = new THREE.PointLight(0xf472b6, 2, 12);
    pinkLight.position.set(2, -2, 4);
    scene.add(pinkLight);
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
        const scale = 2.8 / maxDim;
        robotModel.scale.setScalar(scale);
        robotModel.position.y = -0.2;
        scene.add(robotModel);
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(robotModel);
          mixer.clipAction(gltf.animations[0]).play();
        }
      },
      undefined,
      (error) => console.error("Robot GLTF Error:", error)
    );

    const particleCount = 100;
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
      color: 0x00e5ff, size: 0.05, transparent: true, opacity: 0.85,
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
      color: 0xa855f7, size: 0.05, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    ring.rotation.x = Math.PI / 5;
    ring.position.y = -0.2;
    scene.add(ring);

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      if (mixer) mixer.update(delta);
      if (robotModel) {
        robotModel.rotation.y = elapsed * 0.4;
        robotModel.position.y = -0.2 + Math.sin(elapsed * 1.2) * 0.12;
      }
      ring.position.y = -0.2 + Math.sin(elapsed * 1.2) * 0.12;
      ring.rotation.y = elapsed * 0.3;
      particles.rotation.y = elapsed * 0.15;
      cyanLight.intensity = 5 + Math.sin(elapsed * 2) * 1.5;
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

// ─── GRID BACKGROUND ─────────────────────────────────────────────────────────
function GridBackground() {
  return (
    <div className="grid-bg">
      <div className="grid-bg__pattern" />
    </div>
  );
}

// ─── WHATSAPP FLOAT ───────────────────────────────────────────────────────────
function WhatsAppFloat() {
  const [showMsg, setShowMsg] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef(null);

  const handleClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!dismissed) {
      timerRef.current = setTimeout(() => {
        setShowMsg(true);
      }, 5000);
    }

    // ✅ Replace with your actual WhatsApp number (country code + number, no + or spaces)
    window.open(
      "https://wa.me/8160309700?text=Hi%20Bansil!%20Let%27s%20connect.",
      "_blank"
    );
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setShowMsg(false);
    setDismissed(true);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => {
    if (showMsg) {
      const t = setTimeout(() => setShowMsg(false), 6000);
      return () => clearTimeout(t);
    }
  }, [showMsg]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="wa-float">
      {showMsg && (
        <div className="wa-float__msg">
          <span>Let's connect 💬</span>
          <button className="wa-float__close" onClick={handleDismiss} aria-label="Close">✕</button>
        </div>
      )}
      <button className="wa-float__btn" onClick={handleClick} aria-label="Chat on WhatsApp">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
          <path fillRule="evenodd" clipRule="evenodd"
            d="M16 2C8.268 2 2 8.268 2 16c0 2.442.654 4.733 1.797 6.707L2 30l7.517-1.773A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm-3.47 7.574c-.29-.654-.6-.667-.878-.679-.228-.01-.489-.01-.75-.01-.26 0-.684.098-1.042.489-.357.391-1.368 1.337-1.368 3.26s1.4 3.78 1.595 4.042c.196.26 2.734 4.33 6.7 5.904 3.313 1.307 3.967.99 4.682.845.716-.146 2.31-.945 2.636-1.858.326-.912.326-1.695.228-1.858-.098-.163-.358-.26-.75-.456-.391-.196-2.31-1.14-2.669-1.27-.358-.13-.619-.196-.879.196-.26.391-1.008 1.27-1.237 1.53-.228.26-.456.293-.847.098-.392-.196-1.652-.609-3.148-1.94-1.163-1.037-1.949-2.317-2.177-2.71-.228-.39-.024-.602.172-.797.176-.175.391-.456.587-.685.196-.228.26-.39.39-.65.13-.26.065-.489-.033-.685-.098-.196-.856-2.13-1.21-2.912z"
            fill="#fff"/>
        </svg>
        <span className="wa-float__ring" />
      </button>
    </div>
  );
}

// ─── DATA ────────────────────────────────────────────────────────────────────
const techs = [
  { name: "Python",       icon: <FaPython color="#3776AB" /> },
  { name: "Java",         icon: <FaJava color="#007396" /> },
  { name: "C",            icon: <SiC color="#A8B9CC" /> },
  { name: "NumPy",        icon: <SiNumpy color="#4DABCF" /> },
  { name: "Pandas",       icon: <SiPandas color="#E70488" /> },
  { name: "Scikit-learn", icon: <SiScikitlearn color="#F7931E" /> },
  { name: "Matplotlib",   icon: <FaChartBar color="#11557c" /> },
  { name: "Seaborn",      icon: <FaChartLine color="#4C72B0" /> },
  { name: "LangChain",    icon: <FaLink color="#00e5ff" /> },
  { name: "LangGraph",    icon: <FaProjectDiagram color="#a855f7" /> },
  { name: "FastAPI",      icon: <SiFastapi color="#009688" /> },
  { name: "TensorFlow",   icon: <SiTensorflow color="#FF6F00" /> },
  { name: "OpenCV",       icon: <SiOpencv color="#5C3EE8" /> },
  { name: "Mediapipe",    icon: <FaHandPaper color="#00A2D3" /> },
  { name: "PostgreSQL",   icon: <SiPostgresql color="#336791" /> },
  { name: "MySQL",        icon: <SiMysql color="#4479A1" /> },
  { name: "MongoDB",      icon: <SiMongodb color="#47A248" /> },
  { name: "MS Office",    icon: <FaMicrosoft color="#D83B01" /> },
  { name: "PyCharm",      icon: <SiPycharm color="#c084fc" /> },
  { name: "Jupyter Lab",  icon: <SiJupyter color="#F37626" /> },
];

const experiences = [
  {
    title: "AI Engineer Intern", company: "Skyline Infosys",
    date: "Jan 2025 — May 2025", icon: <FaRobot size="1rem" color="#fff" />, color: "#00e5ff",
    points: ["Gaining hands-on experience with various AI technologies, including data preprocessing, model optimization, and algorithm selection."],
  },
  {
    title: "AI/ML Engineer", company: "Kukami Technology",
    date: "June 2025 — Present", icon: <FaBrain size="1rem" color="#fff" />, color: "#a855f7",
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

const tagColors = ["cyan", "purple", "pink", "orange"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function Section({ id, children, className = "" }) {
  return (
    <section id={id} className={`section ${className}`}>
      <div className="container">{children}</div>
    </section>
  );
}

function SectionTitle({ sub, title, gradientWord }) {
  return (
    <div className="section-title">
      <p className="section-sub reveal reveal--up">
        <span className="sub-dot" />
        {sub}
      </p>
      <h2 className="section-heading reveal reveal--up reveal--d1">
        {gradientWord ? (
          <>
            {title.replace(gradientWord, '')}
            <span className="heading-gradient">{gradientWord}</span>
          </>
        ) : title}
      </h2>
    </div>
  );
}

function SectionDivider() {
  return <div className="section-divider" />;
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
          <div className="logo-icon">B</div>
          Bansil <span className="logo-accent">| AI & ML Developer</span>
        </a>
        <div className="navbar__links">
          {links.map(l => (
            <a key={l} href={`#${l}`} className="navbar__link">{l}</a>
          ))}
        </div>

        {/* ✅ Download CV Button */}
        <a
          href="/KHOKHAR_BANSIL.pdf"
          download
          className="navbar__cv-btn"
        >
          <FaDownload size={11} />
          Download CV
        </a>

        <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Menu">
          <span className={`ham-bar ${open ? "open" : ""}`} />
          <span className={`ham-bar ${open ? "open" : ""}`} />
          <span className={`ham-bar ${open ? "open" : ""}`} />
        </button>
      </div>
      {open && (
        <div className="mobile-menu">
          {links.map(l => (
            <a key={l} href={`#${l}`} className="mobile-link" onClick={() => setOpen(false)}>{l}</a>
          ))}
          {/* CV button in mobile menu too */}
          <a
            href="/KHOKHAR_BANSIL.pdf"
            download
            className="mobile-cv-btn"
            onClick={() => setOpen(false)}
          >
            <FaDownload size={11} /> Download CV
          </a>
        </div>
      )}
    </nav>
  );
}

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero() {
  const typedText = useTypewriter(
    ["AI / ML Engineer", "Backend Developer", "Generative AI Builder", "Problem Solver"],
    85, 45, 2400
  );

  return (
    <section className="hero" id="hero">
      <div className="hero__mesh">
        <div className="hero__mesh-blob hero__mesh-blob--1" />
        <div className="hero__mesh-blob hero__mesh-blob--2" />
        <div className="hero__mesh-blob hero__mesh-blob--3" />
        <div className="hero__mesh-blob hero__mesh-blob--4" />
      </div>

      <div className="hero__grid-pattern" />

      <div className="hero__content-wrap">
        <div className="hero__text">
          <div className="hero__badge">
            <span className="hero__badge-dot" />
            Available for work
          </div>
          <p className="hero__greeting">Hello, I'm</p>
          <h1 className="hero__name">
            <span className="hero__name-gradient">Bansil</span>
          </h1>
          <div className="hero__typewriter-line">
            {typedText}
            <span className="hero__typewriter-cursor" />
          </div>
          <p className="hero__desc">
            I develop intelligent AI solutions, scalable systems & modern applications
            that push the boundaries of what's possible.
          </p>
          <div className="hero__tags">
            <span className="hero__tag hero__tag--cyan">AI / ML</span>
            <span className="hero__tag hero__tag--purple">AI Engineer</span>
            <span className="hero__tag hero__tag--pink">Backend Dev</span>
          </div>
          <div className="hero__ctas">
            <a href="#projects" className="hero__cta-primary">
              View My Work <FaArrowRight size={13} />
            </a>
            <a href="#contact" className="hero__cta-secondary">Get in Touch</a>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__video-container">
            <div className="hero__video-glow" />
            <div className="hero__video-border" />
            <video src="/jarvis-blue.mp4" autoPlay loop muted playsInline className="hero__video" />
          </div>
          <div className="hero__float-shape hero__float-shape--1" />
          <div className="hero__float-shape hero__float-shape--2" />
          <div className="hero__float-shape hero__float-shape--3" />
        </div>
      </div>

      <a href="#about" className="hero__scroll">
        <div className="hero__scroll-track">
          <div className="hero__scroll-thumb" />
        </div>
        <span className="hero__scroll-label">scroll</span>
      </a>
    </section>
  );
}

// ─── ABOUT ───────────────────────────────────────────────────────────────────
function About() {
  const cards = [
    {
      icon: <FaRobot size="1.6rem" color="#00e5ff" />,
      title: "AI/ML Developer",
      desc: "I build intelligent applications using AI, Machine Learning, and modern web technologies.",
      colorClass: "bento-card--cyan"
    },
    {
      icon: <FaBrain size="1.6rem" color="#a855f7" />,
      title: "Generative AI",
      desc: "I create AI-powered experiences with LLMs, automation, and smart assistants.",
      colorClass: "bento-card--purple"
    },
    {
      icon: <FaBolt size="1.6rem" color="#f472b6" />,
      title: "Fast & Scalable",
      desc: "I develop scalable, high-performance applications with clean architecture and modern tools.",
      colorClass: "bento-card--pink"
    },
  ];

  return (
    <Section id="about">
      <SectionTitle sub="Introduction" title="About " gradientWord="Me." />
      <div className="about__layout">
        <p className="about__intro reveal reveal--left">
          I'm an AI/ML developer passionate about building intelligent and user-friendly
          applications using modern technologies. I work with React, JavaScript, Python,
          Machine Learning, and Generative AI tools to create smart solutions that solve
          real-world problems.{" "}
          <span className="about__highlight">
            Let's build innovative AI-powered experiences together!
          </span>
        </p>
        <div className="about__bento">
          {cards.map((c, i) => (
            <div className={`bento-card ${c.colorClass} reveal reveal--right reveal--d${i + 1}`} key={c.title}>
              <div className="bento-card__icon-wrap">{c.icon}</div>
              <h3 className="bento-card__title">{c.title}</h3>
              <p className="bento-card__desc">{c.desc}</p>
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
          <SectionTitle sub="Technologies" title="My " gradientWord="Stack." />
          <div className="tech__grid">
            {techs.map((t, i) => (
              <div className={`tech-pill reveal reveal--up reveal--d${(i % 5) + 1}`} key={t.name}>
                <span className="tech-pill__icon">{t.icon}</span> {t.name}
              </div>
            ))}
          </div>
        </div>
        <div className="tech__canvas-wrap reveal reveal--right">
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
      <SectionTitle sub="Career" title="Work " gradientWord="Experience." />
      <div className="timeline">
        {experiences.map((exp, i) => (
          <div className={`timeline__item reveal reveal--left reveal--d${i + 1}`} key={exp.company}>
            <div className="timeline__node" style={{
              background: exp.color,
              boxShadow: `0 0 20px ${exp.color}80, 0 0 40px ${exp.color}30`
            }}>
              {exp.icon}
            </div>
            <div className="timeline__card">
              <h3 className="timeline__role">{exp.title}</h3>
              <p className="timeline__company" style={{ color: exp.color }}>{exp.company}</p>
              <span className="timeline__date">{exp.date}</span>
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
      <SectionTitle sub="Portfolio" title="Featured " gradientWord="Projects." />
      <div className="projects__grid">
        {projects.map((p, i) => (
          <div className={`project-card reveal reveal--up reveal--d${(i % 3) + 1}`} key={p.name}>
            <div className="project-card__img-wrap">
              <img src={p.img} alt={p.name} className="project-card__img" loading="lazy" />
              <div className="project-card__links">
                <a href="#" className="project-link" aria-label="GitHub"><FaGithub size={16} /></a>
                <a href="#" className="project-link" aria-label="External link"><FaExternalLinkAlt size={14} /></a>
              </div>
            </div>
            <div className="project-card__body">
              <h3 className="project-card__name">{p.name}</h3>
              <p className="project-card__desc">{p.desc}</p>
              <div className="project-card__tags">
                {p.tags.map((t, ti) => (
                  <span key={t} className={`project-tag project-tag--${tagColors[ti % tagColors.length]}`}>
                    {t}
                  </span>
                ))}
              </div>
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
      <SectionTitle sub="Connect" title="Get in " gradientWord="Touch." />

      <div className="contact__intro">
        <h3 className="contact__heading reveal reveal--up">Let's work together.</h3>
        <p className="contact__sub reveal reveal--up reveal--d1">
          Whether you have a project idea, want to collaborate, or just want to say hi —
          my inbox is always open.
        </p>
        <div className="contact__socials reveal reveal--up reveal--d2">
          {socials.map(s => (
            <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="social-pill">
              <span className="social-pill__icon">{s.icon}</span> {s.name}
            </a>
          ))}
        </div>
      </div>

      <div className="contact__layout">
        <form className="contact__form reveal reveal--left" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input className="form-input" name="name" value={form.name} onChange={handleChange}
              placeholder="What's your name?" required />
          </div>
          <div className="form-group">
            <label className="form-label">Your Email</label>
            <input className="form-input" type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="What's your email?" required />
          </div>
          <div className="form-group">
            <label className="form-label">Your Message</label>
            <textarea className="form-input form-textarea" name="message" value={form.message}
              onChange={handleChange} placeholder="Tell me about your project..." rows={5} required />
          </div>
          <button type="submit" className="form-btn">
            {sent ? "✅ Opening Gmail..." : <>Send Message <FaArrowRight size={13} /></>}
          </button>
        </form>

        <div className="contact__robot-wrap reveal reveal--right">
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

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand reveal reveal--up">
            <div className="footer__brand-logo">
              <div className="footer__brand-icon">B</div>
              <span className="footer__brand-name">Bansil</span>
              <span className="footer__brand-title">| AI & ML Developer</span>
            </div>
            <p className="footer__brand-desc">
              Building intelligent AI-powered applications with clean architecture and modern tech.
            </p>
          </div>

          <div className="reveal reveal--up reveal--d1">
            <p className="footer__col-label">Connect</p>
            <div className="footer__social-links">
              {socials.map(s => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                  aria-label={s.name} className="footer__social-btn">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="reveal reveal--up reveal--d2">
            <p className="footer__col-label">Navigate</p>
            <div className="footer__nav-links">
              {["about", "work", "projects", "contact"].map(l => (
                <a key={l} href={`#${l}`} className="footer__nav-link">→ {l}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer__divider reveal reveal--fade reveal--d3" />

        <div className="footer__bottom reveal reveal--fade reveal--d4">
          <p className="footer__copyright">© 2026 Bansil. Engineering the Future with AI</p>
          <a href="#hero" className="footer__back-top">Back to top ↑</a>
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
      <GridBackground />
      <Navbar />
      <Hero />
      <SectionDivider />
      <About />
      <SectionDivider />
      <Tech />
      <SectionDivider />
      <Experience />
      <SectionDivider />
      <Projects />
      <SectionDivider />
      <Contact />
      <Footer />
      {/* ✅ Floating WhatsApp Button */}
      <WhatsAppFloat />
    </div>
  );
}