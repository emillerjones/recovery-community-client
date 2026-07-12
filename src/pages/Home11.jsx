import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import heroPhoto from "../assets/images/hero-lake.jpg";
import "./Home11.css";

const STORIES = [
  {
    quote:
      "I didn't think sobriety was possible for me. I'd tried everything. Cannabis gave me something to hold onto while I figured out the rest.",
    name: "Adrienne",
    detail: "3 years free from opioids",
    color: "#5E83A8",
  },
  {
    quote:
      "The community here never made me feel like I was doing it wrong. That was everything.",
    name: "Marcus",
    detail: "18 months alcohol-free",
    color: "#7B6CA8",
  },
  {
    quote:
      "Ruth's approach made sense to me in a way that AA never did. I finally felt like myself again.",
    name: "Dana",
    detail: "2 years cannabis-assisted recovery",
    color: "#5E8C6A",
  },
  {
    quote:
      "I came here skeptical. I stayed because the people here are real. No judgment. Just honesty.",
    name: "James",
    detail: "Joined 4 years ago",
    color: "#C97B5E",
  },
  {
    quote:
      "For the first time in fifteen years, I woke up and didn't immediately dread the day.",
    name: "Priya",
    detail: "Free from alcohol",
    color: "#8C6B5E",
  },
];


export default function Home11() {
  const { onRegister } = useOutletContext();

  return (
    <main>
      {/* main hero section */}
      <section className="home11-hero__section">
        <div className="home11-hero__photo" style={{ backgroundImage: `url(${heroPhoto})` }} /> 
        <div className="home11-hero__eyebrow">Recovery With The Exit Drug</div>
        <div className="home11-hero__title">Recovery doesn't have to be lonely.</div>
        <div className="home11-hero__subheading">
          A peer-led community where people support one another through recovery,
          share their stories, celebrate progress, and discover a path that works
          for them.
        </div>
        <button onClick={onRegister} className="home11-hero__button">
          Join the community
        </button>
        <div className="home11-hero__scroll">
          Scroll to explore
          <span className="home11-hero__arrow" />
        </div>
      </section>

      {/* philosophy section */}
      <section className="home11-philosophy__section">
        <div className="home11-philosophy__eyebrow">Our Philosophy</div>
        <div className="home11-philosophy__title">Recovery looks different for everyone — and that's okay.</div>
        <div className="home11-philosophy__text">
          Recovery With The Exit Drug cultivates acceptance, encourages healthy
          behaviors, and reduces stigma. There is no single right path. This
          community was built for people who need a different one.
        </div>
      </section>

      {/* real stories section */}
      <section className="home11-story__section">
        <div className="home11-story__eyebrow">Real Stories</div>
        <div className="home11-story__title">People who found their way through.</div>
        {/* <div className="home11-philosophy__text">
          Recovery With The Exit Drug cultivates acceptance, encourages healthy
          behaviors, and reduces stigma. There is no single right path. This
          community was built for people who need a different one.
        </div> */}
        <div className="home11-story__track">
          {STORIES.map((item) => (
            <div className="home11-story__card" key={item.id}>
              <div className="home11-story__name">{item.name}</div>
              <div className="home11-story__detail">{item.detail}</div>
              <div className="home11-story__quote">{item.quote}</div>    
            </div>
          ))}
        </div>
      </section>

    </main>

  )
}
