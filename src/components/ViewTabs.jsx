function ViewTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
            activeTab === tab.value
              ? 'bg-primary text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default ViewTabs;
