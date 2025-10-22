
export const TabButton = ({ label, tabKey, activeTab, setActiveTab }: { label: string; tabKey: string; activeTab: string; setActiveTab: (key: string) => void; }) => (
    <button 
        type="button" 
        onClick={() => setActiveTab(tabKey)} 
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${activeTab === tabKey ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
    >
        {label}
    </button>
);