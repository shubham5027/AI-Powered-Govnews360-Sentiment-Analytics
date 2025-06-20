# Insight GovNews360 AI

GovNews360 AI is an AI-powered, machine learning-driven web application designed for real-time government news monitoring and insights extraction. It automates the end-to-end pipeline of news ingestion, classification, multilingual sentiment analysis, and intelligent alerting, providing a scalable, modern solution for public sector awareness and decision-making.
## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with Shadcn UI components
- **State Management**: React Query
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **Charts**: Recharts
- **PDF Generation**: jsPDF
- **UI Components**: Radix UI primitives with Shadcn UI
- **Animations**: Tailwind CSS Animate
- **Date Handling**: date-fns
- **Translation**: Google Translate API

### Backend & Services
- **Database**: Supabase
- **AI Integration**: Google Generative AI, OpenAI
- **Authentication**: Supabase Auth

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/insight-gov-watch.git
cd insight-gov-watch
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add the following environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── config/        # Configuration files
├── contexts/      # React contexts
├── hooks/         # Custom React hooks
├── integrations/  # Third-party service integrations
├── lib/          # Utility functions and helpers
├── pages/        # Page components
├── services/     # API and service functions
├── types/        # TypeScript type definitions
├── App.tsx       # Main application component
└── main.tsx      # Application entry point
```

## 🔄 Development Workflow

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them:
```bash
git add .
git commit -m "Description of your changes"
```

3. Push your changes and create a pull request:
```bash
git push origin feature/your-feature-name
```

## 🧪 Testing

Run the linter:
```bash
npm run lint
# or
yarn lint
```

## 🏗️ Building for Production

To create a production build:
```bash
npm run build
# or
yarn build
```

To preview the production build:
```bash
npm run preview
# or
yarn preview
```

## 📝 Features

- Real-time government data monitoring
- AI-powered insights and analysis
- Multi-language support
- Interactive data visualization
- PDF report generation
- Responsive design
- Dark/Light mode support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the beautiful component library
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Vite](https://vitejs.dev/) for the build tool
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
#
