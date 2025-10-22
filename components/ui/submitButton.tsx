import React from 'react';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading: boolean;
    loadingText?: string;
    children?: React.ReactNode;
}

export const SubmitButton = ({ isLoading,  loadingText = "Saving...", children, ...props } : SubmitButtonProps) => {
    return (
        <button 
            className='w-full p-3 border-0 rounded-xl bg-blue-600 text-white text-lg font-bold cursor-pointer transition-all duration-300 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed' 
            type="submit" 
            disabled={isLoading} 
            {...props}
        >
            {isLoading ? (
                <div className='flex space-x-2.5 justify-center items-center'>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    {loadingText}
                </div>
            ) : (
                children ? children : 'Save & Finish'
            )}
        </button>
    )
}