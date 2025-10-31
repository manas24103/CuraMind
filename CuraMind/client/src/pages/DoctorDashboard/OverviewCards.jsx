import React from "react";
import { FaUsers, FaCalendarCheck, FaFilePrescription, FaStar } from 'react-icons/fa';
import { BsGraphUp } from 'react-icons/bs';

const OverviewCards = () => {
  const stats = [
    { 
      title: "Total Patients", 
      value: "1,248", 
      icon: <FaUsers className="h-6 w-6" />, 
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      trend: "+12% from last month"
    },
    { 
      title: "Today's Appointments", 
      value: "8", 
      icon: <FaCalendarCheck className="h-6 w-6" />, 
      color: "text-green-500",
      bgColor: "bg-green-50",
      trend: "2 upcoming"
    },
    { 
      title: "Prescriptions", 
      value: "1,540", 
      icon: <FaFilePrescription className="h-6 w-6" />, 
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      trend: "+24 this week"
    },
    { 
      title: "Satisfaction", 
      value: "4.9", 
      icon: <FaStar className="h-6 w-6" />, 
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      trend: "98% positive"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.bgColor} ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="mt-1 text-2xl font-semibold text-gray-900">
                  {stat.value}
                  {stat.title === 'Satisfaction' && (
                    <span className="ml-1 text-yellow-500 text-lg">★</span>
                  )}
                </h3>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-gray-500">
              <BsGraphUp className="mr-1 text-green-500" />
              <span>{stat.trend}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;
