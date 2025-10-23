
import React from 'react';

type IconName = 'user' | 'bot' | 'send';

interface IconProps {
  name: IconName;
  className?: string;
}

const ICONS: Record<IconName, React.FC<React.SVGProps<SVGSVGElement>>> = {
  user: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  bot: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      {/* Stem of the apple */}
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5V3" />
      {/* Apple */}
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.086a3.75 3.75 0 00-4.5 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5c0 1.84-1.44 3.32-3.25 3.48-1.81.16-3.25-1.3-3.25-3.13 0-.3.04-.6.12-.89" />
       {/* Head and Face */}
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.25a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 15.75a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 15.75a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 18.375c.62-.62 1.88-.62 2.5 0" />
      {/* Hair */}
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10.5c0 3.31 2.69 6 6 6s6-2.69 6-6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10.5C7.81 8.25 10.5 7.5 12 7.5s4.19.75 6 3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 13.5c0 4.14 3.36 7.5 7.5 7.5s7.5-3.36 7.5-7.5" />
    </svg>
  ),
  send: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
  ),
};

const Icon: React.FC<IconProps> = ({ name, className }) => {
  const SvgIcon = ICONS[name];
  return <SvgIcon className={className} />;
};

export default Icon;