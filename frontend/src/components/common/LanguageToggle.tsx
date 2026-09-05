import React, { useState } from 'react';
import { LanguageIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import clsx from 'clsx';

interface LanguageToggleProps {
  className?: string;
  variant?: 'button' | 'toggle' | 'dropdown';
  showLabel?: boolean;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  className, 
  variant = 'button',
  showLabel = true 
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isToggling, setIsToggling] = useState(false);

  const toggleLanguage = async () => {
    setIsToggling(true);
    await new Promise(resolve => setTimeout(resolve, 150)); // Smooth transition
    setLanguage(language === 'pt' ? 'en' : 'pt');
    setIsToggling(false);
  };

  const languages = {
    pt: { code: 'PT', name: 'Português', flag: '🇧🇷' },
    en: { code: 'EN', name: 'English', flag: '🇺🇸' }
  };

  const currentLang = languages[language];
  const nextLang = languages[language === 'pt' ? 'en' : 'pt'];

  if (variant === 'toggle') {
    return (
      <div className={clsx('flex items-center space-x-3', className)}>
        <span className="text-sm font-medium text-neutral-600">
          {languages.pt.code}
        </span>
        <button
          onClick={toggleLanguage}
          disabled={isToggling}
          className={clsx(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            language === 'pt' ? 'bg-neutral-200' : 'bg-primary-600',
            isToggling && 'opacity-50'
          )}
          title={t(`common.switchTo${language === 'pt' ? 'English' : 'Portuguese'}`)}
        >
          <span
            className={clsx(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
              language === 'pt' ? 'translate-x-1' : 'translate-x-6'
            )}
          />
        </button>
        <span className="text-sm font-medium text-neutral-600">
          {languages.en.code}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      disabled={isToggling}
      className={clsx(
        'group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
        'bg-white border border-neutral-200 shadow-soft',
        'hover:bg-primary-50 hover:border-primary-300 hover:scale-105 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      title={`Switch to ${nextLang.name}`}
    >
      <div className={clsx(
        'transition-transform duration-200',
        isToggling && 'animate-pulse'
      )}>
        <GlobeAltIcon className="h-5 w-5" />
      </div>
      
      <div className="flex items-center space-x-1">
        <span className="text-base leading-none">
          {currentLang.flag}
        </span>
        {showLabel && (
          <span className="uppercase font-semibold tracking-wider">
            {currentLang.code}
          </span>
        )}
      </div>
      
      <div className={clsx(
        'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        'text-xs text-neutral-500'
      )}>
        →
      </div>
    </button>
  );
};

export default LanguageToggle;