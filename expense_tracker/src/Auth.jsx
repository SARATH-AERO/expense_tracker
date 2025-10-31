import React, { useState, useContext } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { AppContext } from './context/AppContext';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header'; // ✅ Add this line

const Auth = () => {
  const { login, register, currentUser } = useContext(AppContext);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  React.useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        await register(formData);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      {/* ✅ Your site header banner */}
      <Header />

     {/* background area for login/signup */}
      <div
  style={{
    minHeight: 'calc(100vh - 80px)', // full viewport minus header height
    backgroundImage: 'url("/images/loginbackground.avif")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // padding: '40px 0',
    marginTop: '66px' // pushes background down below the header
  }}
>

        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={4}>
              <Card className="shadow-lg bg-white bg-opacity-95 border-0 rounded-4">
                <Card.Body className="p-4">
                  <h2 className="text-center mb-4">
                    {isLogin ? 'Login' : 'Sign Up'}
                  </h2>

                  {error && (
                    <Alert
                      variant="danger"
                      dismissible
                      onClose={() => setError('')}
                    >
                      {error}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    {!isLogin && (
                      <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required={!isLogin}
                        />
                      </Form.Group>
                    )}

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    {!isLogin && (
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required={!isLogin}
                        />
                      </Form.Group>
                    )}

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mb-3"
                    >
                      {isLogin ? 'Login' : 'Sign Up'}
                    </Button>

                    <div className="text-center">
                      <Button
                        variant="link"
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setError('');
                          setFormData({
                            name: '',
                            email: '',
                            password: '',
                            confirmPassword: ''
                          });
                        }}
                      >
                        {isLogin
                          ? "Don't have an account? Sign Up"
                          : 'Already have an account? Login'}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
        </div>
    </>
  );
};

export default Auth;
