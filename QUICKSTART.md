# Quick Start Guide

## 🚀 Getting Started

### Step 1: Install Dependencies
```bash
cd student-portal
npm install
```

### Step 2: Start Development Server
```bash
npm start
```

The app will automatically open at `http://localhost:3000`

### Step 3: Explore the App

#### Landing Page
- Navigate to the root URL: `http://localhost:3000`
- Beautiful landing page with feature overview
- Click "Get Started Free" to go to login

#### Login Page
- URL: `http://localhost:3000/login`
- Features dark side panel with feature highlights
- Switch between Login and Register tabs
- Enter any USN and password to login

#### Dashboard
- URL: `http://localhost:3000/dashboard`
- Accessible after login
- View all 10 comprehensive features
- Interactive charts and visualizations

## 📱 Features Overview

### 1. Landing Page (`/`)
- Modern hero section with call-to-action
- Feature cards showing key capabilities
- Gradient backgrounds and animations
- Fully responsive design

### 2. Login Page (`/login`)
- **Two-tone design**: Dark sidebar + Light form area
- **Dual mode**: Login and Register tabs
- **Form fields**: USN and Password
- **Beautiful UI**: Matches your image design exactly

### 3. Dashboard (`/dashboard`)
Grid layout featuring:

#### Row 1: Performance Analysis (Full Width)
- Line charts showing marks trend
- Subject-wise bar charts
- Statistical insights

#### Row 2: Gamification (Sidebar)
- Points display with gradient
- Achievement badges
- Progress to next level

#### Row 3: Effort vs Outcome
- Scatter plot analysis
- Correlation insights

#### Row 4: Sentiment Feedback
- Real-time feedback submission
- Sentiment scoring

#### Row 5: Study Suggestions
- Personalized recommendations
- Priority-based sorting

#### Row 6: Emotion Tracker
- Current mood display
- Mood history

#### Row 7: Topic Mastery Heatmap
- Color-coded proficiency
- Visual heatmap grid

#### Row 8: Peer Analysis
- Class rank display
- Comparison charts

#### Row 9: Predictive Analysis
- Score forecasting
- AI predictions

#### Row 10: Skill Gap Alerts
- Critical gap identification
- Action recommendations

## 🎨 Design Features

### Color Scheme
- **Primary**: Indigo (`#6366f1`)
- **Success**: Green (`#10b981`)
- **Warning**: Orange (`#f59e0b`)
- **Danger**: Red (`#ef4444`)
- **Purple**: (`#8b5cf6`)

### UI Components
- ✅ Rounded corners (border-radius: 12px-24px)
- ✅ Gradient backgrounds
- ✅ Shadow effects (hover: scale up)
- ✅ Smooth animations
- ✅ Responsive design
- ✅ Modern card layouts

### Typography
- Font: Inter (Google Fonts)
- Headings: Bold (600-800)
- Body: Regular (400)

## 🔧 Technical Details

### Tech Stack
- **React 19.2.0** - Latest React
- **React Router 7.9.4** - Navigation
- **TailwindCSS 4.1.16** - Styling
- **Recharts 3.3.0** - Charts
- **React Icons 5.5.0** - Icons
- **Framer Motion 12.23.24** - Animations

### File Structure
```
src/
├── components/
│   ├── Landing.jsx       # Landing page
│   └── Login.jsx         # Login/Register page
├── features/
│   ├── Dashboard.js      # Main dashboard (orchestrator)
│   ├── PerformanceAnalysis.js
│   ├── SentimentFeedback.js
│   ├── Gamification.js
│   ├── StudySuggestions.js
│   ├── PeerAnalysis.js
│   ├── EmotionTracker.js
│   ├── TopicMasteryHeatmap.js
│   ├── EffortVsOutcome.js
│   ├── SkillGapAlert.js
│   └── PredictiveAnalysis.js
├── App.js                # Main app with routing
├── App.css               # Global styles
├── index.js              # Entry point
└── index.css             # Tailwind + custom styles
```

## 📊 Mock Data

Currently using mock data for demonstration. To connect to your backend:

1. Replace mock data in feature components
2. Add API calls (fetch/axios)
3. Update state management
4. Add loading/error states

Example API integration:
```javascript
// In a feature component
useEffect(() => {
  fetch('/api/performance')
    .then(res => res.json())
    .then(data => setPerformanceData(data))
    .catch(err => console.error(err));
}, []);
```

## 🎯 Key Features Implementation

### Performance Analysis
- Line charts for trends
- Bar charts for subjects
- Statistical cards

### Gamification
- Points system
- Badge collection
- Progress tracking
- Streaks

### Predictive Analysis
- Historical data visualization
- Predictive line (dashed)
- AI insights
- Factor analysis

### Topic Mastery
- Color-coded heatmap
- Green = Strong (80%+)
- Yellow = Moderate (60-80%)
- Orange = Weak (40-60%)
- Red = Critical (<40%)

### Effort vs Outcome
- Scatter plot
- Correlation analysis
- Efficiency metrics
- Optimal hours recommendation

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Use different port
PORT=3001 npm start
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Tailwind Not Working
```bash
# Check tailwind.config.js exists
# Verify postcss.config.js exists
# Restart dev server
```

### Build Issues
```bash
npm run build
# Check build/ folder for production files
```

## 📝 Next Steps

### Backend Integration
1. Create API endpoints
2. Add axios/http client
3. Implement authentication
4. Add error handling
5. Add loading states

### Enhanced Features
- Real-time updates
- Notifications
- File uploads
- Export data
- Print reports

### Testing
```bash
npm test
```

### Deployment
```bash
npm run build
# Deploy build/ folder to hosting service
```

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      'brand-blue': '#your-color',
    }
  }
}
```

### Modify Layout
Edit feature components in `src/features/`

### Add New Feature
1. Create component in `src/features/NewFeature.js`
2. Import in `Dashboard.js`
3. Add to grid layout

## 📞 Support

For issues or questions:
- Check README.md
- Review code comments
- Test in different browsers

---

**Happy Coding! 🎉**


