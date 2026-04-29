import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { postsAPI } from '../services/api';

const Scheduler = ({ post, platforms, onScheduled }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('08:00');
  const [loading, setLoading] = useState(false);
  const [repeat, setRepeat] = useState('none');

  const quickSlots = [
    { label: '🌅 Mâine dimineață', date: getDateOffset(1), time: '08:00' },
    { label: '☀️ Mâine prânz', date: getDateOffset(1), time: '12:00' },
    { label: '🌙 Mâine seară', date: getDateOffset(1), time: '20:00' },
    { label: '📅 Poimâine', date: getDateOffset(2), time: '09:00' },
    { label: '🗓️ Duminică', date: getNextSunday(), time: '09:00' }
  ];

  function getDateOffset(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function getNextSunday() {
    const d = new Date();
    const day = d.getDay();
    const daysUntilSunday = day === 0 ? 7 : 7 - day;
    d.setDate(d.getDate() + daysUntilSunday);
    return d.toISOString().slice(0, 10);
  }

  const handleSchedule = async () => {
    if (!date) {
      toast.error('Alege o dată');
      return;
    }
    const scheduledFor = new Date(`${date}T${time}`);
    if (scheduledFor <= new Date()) {
      toast.error('Data trebuie să fie în viitor');
      return;
    }

    setLoading(true);
    try {
      await postsAPI.create({
        ...post,
        platforms,
        status: 'scheduled',
        scheduledFor,
        repeat
      });
      toast.success('Postare programată cu succes! 📅');
      onScheduled?.();
    } catch (error) {
      toast.error('Eroare la programare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="font-semibold text-gray-800 mb-4">📅 Programează Postarea</h3>

      {/* Quick Slots */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
          Ore rapide
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {quickSlots.map((slot) => (
            <button
              key={slot.label}
              onClick={() => { setDate(slot.date); setTime(slot.time); }}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                date === slot.date && time === slot.time
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              {slot.label}
              <span className="text-xs text-gray-400 ml-2">
                {new Date(`${slot.date}T${slot.time}`).toLocaleDateString('ro-RO', {
                  day: 'numeric', month: 'short'
                })} la {slot.time}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date/Time */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
            Data
          </label>
          <input
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
            Ora
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Repeat */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
          Repetare
        </label>
        <select
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="none">Fără repetare</option>
          <option value="daily">Zilnic</option>
          <option value="weekly">Săptămânal</option>
          <option value="monthly">Lunar</option>
        </select>
      </div>

      {/* Summary */}
      {date && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm text-blue-800">
          📅 Va fi publicat pe <strong>{platforms?.join(', ')}</strong> în{' '}
          <strong>
            {new Date(`${date}T${time}`).toLocaleDateString('ro-RO', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </strong>
        </div>
      )}

      <button
        onClick={handleSchedule}
        disabled={loading || !date}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Programare...
          </>
        ) : (
          '📅 Confirmă Programarea'
        )}
      </button>
    </div>
  );
};

export default Scheduler;