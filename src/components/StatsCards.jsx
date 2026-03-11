import { RiTimeLine } from 'react-icons/ri';
import { RiTimerLine } from 'react-icons/ri';
import { RiCalendarCheckLine } from 'react-icons/ri';

function StatsCards({ data }) {
  const calculateStats = () => {
    let totalHours = 0;
    let totalOvertime = 0;

    data.forEach(shift => {
      totalHours += parseFloat(shift.totalHours) || 0;
      totalOvertime += parseFloat(shift.overtime?.hours) || 0;
    });

    return {
      totalHours: totalHours.toFixed(1),
      totalOvertime: totalOvertime.toFixed(1),
      daysWorked: data.length,
    };
  };

  const stats = calculateStats();

  const cardClasses = "bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow";
  const labelClasses = "text-sm font-medium text-slate-500";
  const valueClasses = "text-3xl font-bold text-slate-800";
  const iconContainerClasses = "bg-slate-100 p-3 rounded-xl";
  const iconClasses = "w-8 h-8 text-slate-700";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* Total Hours */}
      <div className={cardClasses}>
        <div className="flex items-center justify-between">
          <div>
            <p className={labelClasses}>Total Hours</p>
            <p className={valueClasses}>{stats.totalHours}</p>
          </div>
          <div className={iconContainerClasses}>
            <RiTimeLine className={iconClasses} />
          </div>
        </div>
      </div>

      {/* Total Overtime Hours */}
      <div className={cardClasses}>
        <div className="flex items-center justify-between">
          <div>
            <p className={labelClasses}>Overtime Hours</p>
            <p className={valueClasses}>{stats.totalOvertime}</p>
          </div>
          <div className={iconContainerClasses}>
            <RiTimerLine className={iconClasses} />
          </div>
        </div>
      </div>

      {/* Days Worked */}
      <div className={cardClasses}>
        <div className="flex items-center justify-between">
          <div>
            <p className={labelClasses}>Days Worked</p>
            <p className={valueClasses}>{stats.daysWorked}</p>
          </div>
          <div className={iconContainerClasses}>
            <RiCalendarCheckLine className={iconClasses} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsCards;
