
import React from 'react';

type IconName = 'user' | 'bot' | 'send' | 'bug' | 'close';

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
  bug: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" width="24" height="24">
      <path d="M4.355.522a.5.5 0 0 1 .623.333l.291.956A4.979 4.979 0 0 1 8 1c1.007 0 1.946.298 2.731.811l.29-.956a.5.5 0 1 1 .957.29l-.41 1.352A4.985 4.985 0 0 1 13 6h.5a.5.5 0 0 0 .5-.5V5a.5.5 0 0 1 1 0v.5A1.5 1.5 0 0 1 13.5 7H13v1h1.5a.5.5 0 0 1 0 1H13v1h.5a1.5 1.5 0 0 1 1.5 1.5v.5a.5.5 0 1 1-1 0v-.5a.5.5 0 0 0-.5-.5H13a5 5 0 0 1-10 0h-.5a.5.5 0 0 0-.5.5v.5a.5.5 0 1 1-1 0v-.5A1.5 1.5 0 0 1 2.5 11H3V9H1.5a.5.5 0 0 1 0-1H3V7H1.5A1.5 1.5 0 0 1 1 5.5V5a.5.5 0 0 1 1 0v.5a.5.5 0 0 0 .5.5H3c0-1.364.547-2.601 1.432-3.503l-.41-1.352a.5.5 0 0 1 .333-.623zM8 7a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4zm0 1a3 3 0 0 1 3 3H5a3 3 0 0 1 3-3zm-2-6.118A3.993 3.993 0 0 0 8 2a3.993 3.993 0 0 0 2-1.118l-.29.956A3.998 3.998 0 0 0 8 3a3.998 3.998 0 0 0-1.71-.162l-.29-.956z"/>
    </svg>
  ),
  close: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  ),
};

const Icon: React.FC<IconProps> = ({ name, className }) => {
  const SvgIcon = ICONS[name];
  return <SvgIcon className={className} />;
};

export default Icon;