import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', backgroundColor: 'black', minHeight: '100vh', overflow: 'auto' }}>
          <h1 style={{fontSize: '20px', fontWeight: 'bold'}}>Giao diện bị lỗi (App Crashed)</h1>
          <p style={{marginBottom: '20px', color: 'yellow'}}>Vui lòng CHỤP ẢNH MÀN HÌNH trang này và gửi cho lập trình viên để sửa lỗi!</p>
          <details style={{ whiteSpace: 'pre-wrap', color: 'white', fontSize: '12px', background: '#222', padding: '10px', borderRadius: '5px' }}>
            <summary style={{cursor: 'pointer', marginBottom: '10px'}}>Xem chi tiết mã lỗi (Click here)</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', background: 'white', color: 'black', borderRadius: '5px', fontWeight: 'bold' }}>Tải lại trang</button>
        </div>
      );
    }
    return this.props.children; 
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
