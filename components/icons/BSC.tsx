'use client';

import React from 'react';

interface IconProps {
  active?: boolean;
}

export default function BSCIcon({ active = false }: IconProps) {
  return (
    <svg
      version="1.1"
      viewBox="0 0 3000 3000"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="100%"
      height="100%"
    >
      <g>
        <path
          className={active ? 'fill-[#F0B90B]' : 'fill-[#ccc]'}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1248,0c689.3,0,1248,558.7,1248,1248s-558.7,1248-1248,1248
            S0,1937.3,0,1248S558.7,0,1248,0L1248,0z"
        />
        <path
          className="fill-[#FFFFFF]"
          d="M685.9,1248l0.9,330l280.4,165v193.2l-444.5-260.7v-524L685.9,1248z
            M685.9,918v192.3l-163.3-96.6V821.4l163.3-96.6l164.1,96.6L685.9,918z
            M1084.3,821.4l163.3-96.6l164.1,96.6L1247.6,918L1084.3,821.4z"
        />
        <path
          className="fill-[#FFFFFF]"
          d="M803.9,1509.6v-193.2l163.3,96.6v192.3L803.9,1509.6z
            M1084.3,1812.2l163.3,96.6l164.1-96.6v192.3l-164.1,96.6l-163.3-96.6V1812.2z
            M1645.9,821.4l163.3-96.6l164.1,96.6v192.3l-164.1,96.6V918L1645.9,821.4z
            M1809.2,1578l0.9-330l163.3-96.6v524l-444.5,260.7v-193.2L1809.2,1578z"
        />
        <polygon
          className="fill-[#FFFFFF]"
          points="1692.1,1509.6 1528.8,1605.3 1528.8,1413 1692.1,1316.4 1692.1,1509.6"
        />
        <path
          className="fill-[#FFFFFF]"
          d="M1692.1,986.4l0.9,193.2l-281.2,165v330.8l-163.3,95.7l-163.3-95.7v-330.8l-281.2-165V986.4
            L968,889.8l279.5,165.8l281.2-165.8l164.1,96.6H1692.1z
            M803.9,656.5l443.7-261.6l444.5,261.6l-163.3,96.6l-281.2-165.8L967.2,753.1L803.9,656.5z"
        />
      </g>
    </svg>
  );
}
