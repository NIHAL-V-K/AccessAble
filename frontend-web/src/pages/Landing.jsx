import { motion } from "framer-motion";
import {
  Accessibility,
  ArrowRight,
  AudioLines,
  Eye,
  Hand,
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Users,
  MoveUpRight
} from "lucide-react";

import Navbar from "../components/Navbar";

export default function Landing() {

  const features = [
    {
      icon: Eye,
      title: "Visual Intelligence",
      description:
        "Transform complex visual information into understandable and accessible experiences."
    },
    {
      icon: AudioLines,
      title: "Audio Assistance",
      description:
        "Experience information through intelligent text-to-speech and audio guidance."
    },
    {
      icon: Hand,
      title: "Haptic Interaction",
      description:
        "Make digital information more tangible through interactive vibration feedback."
    },
    {
      icon: BrainCircuit,
      title: "AI Powered Learning",
      description:
        "Use intelligent assistance to make learning more inclusive and personalized."
    }
  ];

  const solutions = [
    {
      number: "01",
      title: "For Students",
      description:
        "An inclusive learning environment with accessible content, personalized assistance and interactive experiences.",
      icon: BookOpen
    },
    {
      number: "02",
      title: "For Educators",
      description:
        "Create, manage and share accessible educational resources with students.",
      icon: Users
    },
    {
      number: "03",
      title: "For Institutions",
      description:
        "Manage accessibility services and build a more inclusive educational ecosystem.",
      icon: ShieldCheck
    }
  ];

  return (
    <div className="landing-page">

      <Navbar />

      {/* HERO SECTION */}

      <section className="hero">

        <div className="hero-content">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="hero-badge"
          >
            <Sparkles size={15} />
            Technology with a human purpose
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            A world where
            <br />
            <span>everyone belongs.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="hero-description"
          >
            Making digital learning more accessible through
            artificial intelligence, assistive technology
            and inclusive innovation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="hero-buttons"
          >
            <a href="/register" className="primary-button">
              Explore AccessAble
              <ArrowRight size={18} />
            </a>

            <a href="#features" className="secondary-button">
              Discover more
            </a>
          </motion.div>

          <div className="hero-trust">
            <div className="trust-icon">
              <Accessibility size={19} />
            </div>

            <p>
              Designed around people.
              <strong> Built for everyone.</strong>
            </p>
          </div>

        </div>

        {/* HERO VISUAL */}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="hero-visual"
        >

          <div className="visual-circle circle-one"></div>
          <div className="visual-circle circle-two"></div>

          <div className="visual-main-card">

            <div className="visual-top">
              <span>ACCESSABLE EXPERIENCE</span>
              <Sparkles size={19} />
            </div>

            <div className="visual-symbol">
              <Accessibility size={85} strokeWidth={1.2} />
            </div>

            <h3>Accessibility is for everyone.</h3>

            <p>
              Different abilities. Equal opportunities.
            </p>

            <div className="visual-progress">
              <span></span>
            </div>

            <div className="visual-bottom">
              <span>Inclusive by design</span>
              <span>01 / 03</span>
            </div>

          </div>

          <div className="floating-card floating-one">
            <AudioLines size={22} />
            <div>
              <strong>Audio Support</strong>
              <small>Information made audible</small>
            </div>
          </div>

          <div className="floating-card floating-two">
            <Hand size={22} />
            <div>
              <strong>Haptic Feedback</strong>
              <small>Feel the information</small>
            </div>
          </div>

        </motion.div>

      </section>

      {/* INTRO SECTION */}

      <section className="intro-section" id="about">

        <div className="intro-label">
          <span></span>
          OUR PURPOSE
        </div>

        <h2>
          Accessibility shouldn't be
          <br />
          an afterthought.
          <span> It should be the foundation.</span>
        </h2>

        <p>
          AccessAble brings together intelligent technology
          and inclusive design to reduce barriers in digital
          education and everyday information access.
        </p>

      </section>

      {/* FEATURES */}

      <section className="features-section" id="features">

        <div className="section-heading">

          <div>
            <span className="section-eyebrow">
              WHAT WE OFFER
            </span>

            <h2>
              Technology that
              <br />
              <span>opens possibilities.</span>
            </h2>
          </div>

          <p>
            Thoughtfully designed tools that help
            make digital experiences more inclusive.
          </p>

        </div>

        <div className="feature-grid">

          {features.map((feature, index) => {

            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                className="feature-card"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
              >

                <div className="feature-icon">
                  <Icon size={27} />
                </div>

                <span className="feature-number">
                  0{index + 1}
                </span>

                <h3>{feature.title}</h3>

                <p>{feature.description}</p>

                <ArrowRight className="feature-arrow" size={20} />

              </motion.div>

            );

          })}

        </div>

      </section>

      {/* SOLUTIONS */}

      <section className="solutions-section" id="solutions">

        <div className="solutions-heading">

          <span className="section-eyebrow">
            ONE PLATFORM. MULTIPLE POSSIBILITIES.
          </span>

          <h2>
            Designed for every
            <br />
            part of the journey.
          </h2>

        </div>

        <div className="solutions-grid">

          {solutions.map((solution) => {

            const Icon = solution.icon;

            return (

              <div className="solution-card" key={solution.number}>

                <div className="solution-top">
                  <span>{solution.number}</span>
                  <Icon size={27} />
                </div>

                <h3>{solution.title}</h3>

                <p>{solution.description}</p>

                <MoveUpRight size={21} />

              </div>

            );

          })}

        </div>

      </section>

      {/* CTA */}

      <section className="cta-section">

        <div className="cta-content">

          <span>THE FUTURE IS INCLUSIVE</span>

          <h2>
            Let's make room
            <br />
            for <em>everyone.</em>
          </h2>

          <p>
            Join us in creating a digital world
            without unnecessary barriers.
          </p>

          <a href="/register" className="cta-button">
            Get started
            <ArrowRight size={18} />
          </a>

        </div>

        <div className="cta-decoration">
          <Accessibility size={170} strokeWidth={0.7} />
        </div>

      </section>

      {/* FOOTER */}

      <footer className="footer">

        <div className="footer-brand">

          <div className="brand-icon">
            <Accessibility size={24} />
          </div>

          <span>
            access<span className="brand-highlight">able</span>
          </span>

        </div>

        <p>
          Making accessibility a part of everything.
        </p>

        <span className="footer-copy">
          © 2026 AccessAble. Built for everyone.
        </span>

      </footer>

    </div>
  );
}