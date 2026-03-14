
import React, { useState, useEffect } from "react";
import "./App.css";
import confetti from "canvas-confetti";

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function App() {

  const today = new Date();
  const todayStr = formatDate(today);

  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const [marked, setMarked] = useState(() => {
    const saved = localStorage.getItem("exercise-data");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("exercise-data", JSON.stringify(marked));
  }, [marked]);

  /* Notification permission */
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const hour = new Date().getHours();

    if (hour >= 20 && !marked[todayStr]) {
      if (Notification.permission === "granted") {
        new Notification("Workout Reminder 💪", {
          body: "You have not exercised today!"
        });
      }
    }

  }, [marked, todayStr]);

  function toggle(date) {

    if (date !== todayStr) return;

    const newState = {
      ...marked,
      [date]: !marked[date]
    };

    setMarked(newState);

    if (!marked[date]) {
      confetti({
        particleCount: 120,
        spread: 80
      });
    }

  }

  function calculateStreak() {

    let streak = 0;
    let d = new Date();

    while (true) {

      const key = formatDate(d);

      if (marked[key]) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }

    }

    return streak;
  }

  function longestStreak() {

    let max = 0;
    let current = 0;

    const dates = Object.keys(marked).sort();

    for (let d of dates) {

      if (marked[d]) {
        current++;
        max = Math.max(max, current);
      } else {
        current = 0;
      }

    }

    return max;

  }

  const streak = calculateStreak();
  const best = longestStreak();

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  function nextMonth() {

    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }

  }

  function prevMonth() {

    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }

  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendar = [];

  for (let i = 0; i < firstDay; i++) {
    calendar.push(<div key={"empty" + i}></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {

    const date = formatDate(new Date(year, month, d));
    const isToday = date === todayStr;

    calendar.push(

      <div
        key={date}
        className={
          "date " +
          (marked[date] ? "done " : "") +
          (!isToday ? "disabled " : "") +
          (isToday ? "today" : "")
        }
        onClick={() => toggle(date)}
      >
        {d}
      </div>

    );
  }

  const monthDates = Object.keys(marked).filter(d => d.startsWith(`${year}-${String(month+1).padStart(2,'0')}`));
  const progress = Math.round((monthDates.length / daysInMonth) * 100);

  return (

    <div className="app">

      <h1>💪 Exercise Tracker</h1>

      <div className="stats">
        <div>🔥 Streak: {streak}</div>
        <div>🏆 Best: {best}</div>
      </div>

      <div className="progress">
        <div className="bar" style={{width: progress + "%"}}></div>
      </div>

      <div className="calendar">

        <div className="header">

          <button onClick={prevMonth}>◀</button>

          <h3>{months[month]} {year}</h3>

          <button onClick={nextMonth}>▶</button>

        </div>

        <div className="weekdays">
          {days.map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="dates">
          {calendar}
        </div>

      </div>

    </div>

  );
}
