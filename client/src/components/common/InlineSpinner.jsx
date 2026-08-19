import React from 'react';
import { PixoraMark } from '../brand/PixoraMark';

export const InlineSpinner = ({ size = 16, className = '' }) => {
  return <PixoraMark size={size} animate={true} className={className} />;
};
