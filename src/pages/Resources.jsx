import React from "react";
import Slideshow from "./Slideshow";
import better from "../images/betterhelp.png";
import simple from "../images/simplepractice.png";
import bright from "../images/brightside.png";
import "../styles/resources.css";

export default function Resources() {
  const resources = [
    {
      title: "Better Help",
      subtitle: "Online therapy and counseling",
      href: "https://www.betterhelp.com/",
      img: better,
      target: "_blank",
    },
    {
      title: "SimplePractice",
      subtitle: "Practice management for health pros",
      href: "https://www.simplepractice.com/",
      img: simple,
      target: "_blank",
    },
    {
      title: "Brightside",
      subtitle: "Medication & therapy for anxiety/depression",
      href: "https://www.brightside.com/",
      img: bright,
      target: "_blank",
    },
  ];

  return (
    <section id="resources" className="resources">
      <h1 className="resources-heading">Resources</h1>

      <Slideshow items={resources} autoplayDelay={4500} />

      <section className="map">
        <h2>Our Resource Offices</h2>
        <iframe
          title="resource-map"
          src="https://www.google.com/maps/d/u/0/embed?mid=1I4A9tTiFl72-Ddk1BkPjQINnGmQgIbg&ehbc=2E312F"
          width="640"
          height="480"
        />
      </section>
    </section>
  );
}
