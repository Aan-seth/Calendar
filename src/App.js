import React, { useState, useEffect } from "react";
import "./App.css";

/* Fix timezone problem */
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

  /* Only allow today to toggle */
  function toggle(date) {

    if (date !== todayStr) return;

    setMarked(prev => ({
      ...prev,
      [date]: !prev[date]
    }));

  }

  /* Streak calculation */
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

  const streak = calculateStreak();

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

  return (

    <div className="app">

      <h1>💪 Exercise Tracker</h1>

      <h2>🔥 Streak: {streak} days</h2>

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