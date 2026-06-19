import React, { useState } from "react";

const maleAvatars = [
  "https://images.unsplash.com/photo-1507152832244-10d49c7eda8f?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1618018352910-33b556d30d50?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1634896941598-b6b500a502a7?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&w=150&h=150&q=80"
];

const femaleAvatars = [
  "https://images.unsplash.com/photo-1602233158242-3ba0ac4d2167?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?auto=format&fit=crop&w=150&h=150&q=80"
];

// Helper to determine if a name is typically female
function isFemaleName(name) {
  const lowercase = name.toLowerCase();
  const femaleKeywords = [
    "sarah", "priya", "ananya", "sunita", "kavita", "pooja", 
    "divya", "neha", "aisha", "sneha", "aditi", "isha", 
    "riyah", "tanvi", "shruti", "payal", "rhea", "deepa", 
    "jyoti", "meera", "swati", "anjali", "jenkins"
  ];
  return femaleKeywords.some(keyword => lowercase.includes(keyword));
}

// Map specific names to exact portraits for high-quality consistent display
const nameSpecificMap = {
  "Sarah Jenkins": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
  "Kamal Hassan": "https://images.unsplash.com/photo-1507152832244-10d49c7eda8f?auto=format&fit=crop&w=150&h=150&q=80",
  "Aarav Mehta": "https://images.unsplash.com/photo-1618018352910-33b556d30d50?auto=format&fit=crop&w=150&h=150&q=80",
  "Kunal Bansal": "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=150&h=150&q=80",
  "Varun Khanna": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&h=150&q=80",
  "Rajesh Nigam": "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?auto=format&fit=crop&w=150&h=150&q=80",
  "Amit Sharma": "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=150&h=150&q=80",
  "Shreyas Prakash": "https://images.unsplash.com/photo-1634896941598-b6b500a502a7?auto=format&fit=crop&w=150&h=150&q=80",
  "Shreyas Dakhole": "https://images.unsplash.com/photo-1634896941598-b6b500a502a7?auto=format&fit=crop&w=150&h=150&q=80",
  "Shreyas Prakash Dakhole": "https://images.unsplash.com/photo-1634896941598-b6b500a502a7?auto=format&fit=crop&w=150&h=150&q=80",
  "Pranav Goyal": "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&w=150&h=150&q=80",
  "Rohit Sharma": "https://images.unsplash.com/photo-1507152832244-10d49c7eda8f?auto=format&fit=crop&w=150&h=150&q=80",
  "Admin User": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&h=150&q=80"
};

function getAvatarUrl(name) {
  if (!name || name === "?" || name.length <= 2) return null;
  
  const cleanName = name.trim();
  
  // 1. Check direct name specific mapping
  if (nameSpecificMap[cleanName]) {
    return nameSpecificMap[cleanName];
  }
  
  // 2. Fallback to hash-based stable mapping
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  
  if (isFemaleName(cleanName)) {
    return femaleAvatars[hash % femaleAvatars.length];
  } else {
    return maleAvatars[hash % maleAvatars.length];
  }
}

export default function Avatar({ name = "?", size = "md" }) {
  const [imgError, setImgError] = useState(false);
  
  if (!name) name = "?";
  
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const firstLetter = initials[0] || "?";
  
  let colorClass = "bg-blue-50 text-blue-700 border border-blue-100";
  
  if (/[A-F]/.test(firstLetter)) {
    colorClass = "bg-blue-50 text-blue-700 border border-blue-100";
  } else if (/[G-L]/.test(firstLetter)) {
    colorClass = "bg-teal-50 text-teal-700 border border-teal-100";
  } else if (/[M-R]/.test(firstLetter)) {
    colorClass = "bg-amber-50 text-amber-700 border border-amber-100";
  } else if (/[S-Z]/.test(firstLetter)) {
    colorClass = "bg-purple-50 text-purple-700 border border-purple-100";
  }

  const sizeClasses = {
    sm: "w-8 h-8 text-xs font-semibold",
    md: "w-10 h-10 text-sm font-semibold",
    lg: "w-12 h-12 text-base font-semibold",
    xl: "w-16 h-16 text-lg font-bold"
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const avatarUrl = getAvatarUrl(name);

  return (
    <div className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center shrink-0 overflow-hidden`}>
      {avatarUrl && !imgError ? (
        <img 
          src={avatarUrl} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        initials || "?"
      )}
    </div>
  );
}
