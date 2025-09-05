import React from 'react';
import AutoFormatContent from './AutoFormatContent';

const ContentDemo: React.FC = () => {
  const sampleContent = `# Getting Started with React

## Introduction
React is a **powerful** JavaScript library for building user interfaces. It allows you to create *reusable* components and manage state efficiently.

> **Note**: This is an important framework for modern web development.

## Key Features
- **Component-based architecture**: This is essential for scalable applications
- **Virtual DOM**: A critical optimization feature for performance
- **JSX syntax**: The main advantage of React for templating
- **Unidirectional data flow**: A fundamental concept for state management

---

## Installation Steps
1. **Install Node.js**: Required for development environment
2. **Create React project**: Use \`create-react-app\` for quick setup
3. **Start development server**: Run the local development environment
4. **Begin coding**: Start with the basic setup and examples!

## Code Examples

### JavaScript Component
\`\`\`javascript:App.js
import React from 'react';

function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="app">
      <h1>Hello World!</h1>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}

export default App;
\`\`\`

### TypeScript Interface
\`\`\`typescript:types.ts
interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

type UserRole = 'admin' | 'user' | 'guest';

const createUser = (data: Partial<User>): User => {
  return {
    id: generateId(),
    name: data.name || '',
    email: data.email || '',
    isActive: data.isActive ?? true
  };
};
\`\`\`

### Python Function
\`\`\`python:utils.py
def calculate_fibonacci(n: int) -> int:
    """
    Calculate the nth Fibonacci number
    """
    if n <= 1:
        return n
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    
    return b

# Example usage
result = calculate_fibonacci(10)
print(f"Fibonacci(10) = {result}")
\`\`\`

### CSS Styling
\`\`\`css:styles.css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background-color: #3b82f6;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
}
\`\`\`

## Best Practices
- **Keep components small**: This is crucial for maintainability and testing
- **Use React hooks**: Advanced features like \`useState\` and \`useEffect\`
- **Follow single responsibility**: Each component should have one clear purpose
- **Write clean code**: Maintainable and readable code structure

> **Tip**: Always use TypeScript for better type safety and developer experience.

This is a paragraph with some **bold text** and *italic text*. You can also use \`inline code\` for technical terms. The word important should be highlighted automatically, along with other key terms like essential, critical, and solution.

## References and Links
Here are some useful resources for learning React:

- **Official Documentation**: [React Documentation](https://reactjs.org/docs/getting-started.html)
- **Tutorial**: [React Tutorial](https://reactjs.org/tutorial/tutorial.html)
- **Community**: Visit https://reactjs.org/community for support
- **GitHub**: Check out www.github.com/facebook/react for the source code
- **Contact**: Email us at support@reactjs.org for questions

Reference links like [1], [2], and [3] are automatically highlighted.

See: https://reactjs.org/docs/hooks-intro.html for more on hooks
Source: www.reactjs.org for official resources
Learn: https://reactjs.org/community for community support

---

## Advanced Topics
- **State management**: Redux for complex state handling
- **Server-side rendering**: Next.js for SEO and performance
- **Testing**: Jest and React Testing Library for comprehensive testing

[Learn more about React](https://reactjs.org/)`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Enhanced Auto Format Content Demo
        </h1>
        <p className="text-gray-600 mb-6">
          This component automatically detects and formats text content with enhanced markdown support, subheadings, and clickable reference links
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Sample API Response with Link Detection
        </h2>
        <AutoFormatContent 
          content={sampleContent}
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Raw Content (for reference)
        </h3>
        <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-4 rounded border">
          {sampleContent}
        </pre>
      </div>
    </div>
  );
};

export default ContentDemo;
