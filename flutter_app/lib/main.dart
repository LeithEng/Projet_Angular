import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/app_theme.dart';
import 'providers/auth_provider.dart';
import 'services/api_service.dart';
import 'pages/auth/login_page.dart';
import 'pages/auth/register_page.dart';
import 'pages/profile/profile_page.dart';
import 'pages/home/home_page.dart';
import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await windowManager.ensureInitialized();

  windowManager.setSize(Size(375, 812)); // iPhone dimensions
  windowManager.center();

  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<ApiService>(
          create: (_) => ApiService(),
        ),
        ChangeNotifierProvider<AuthProvider>(
          create: (context) => AuthProvider(
            Provider.of<ApiService>(context, listen: false),
          ),
        ),
      ],
      child: MaterialApp(
        title: 'SahbiFlix',
        theme: AppTheme.darkTheme,
        debugShowCheckedModeBanner: false,
        initialRoute: '/splash',
        routes: {
          '/splash': (context) => const SplashScreen(),
          '/login': (context) => const LoginPage(),
          '/register': (context) => const RegisterPage(),
          '/home': (context) => const HomePage(),
          '/profile': (context) => const ProfilePage(),
        },
      ),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final apiService = Provider.of<ApiService>(context, listen: false);

    // Small delay for splash effect
    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;

    final isAuthenticated = await apiService.isAuthenticated();

    if (isAuthenticated) {
      try {
        await authProvider.refreshProfile();
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/home');
        }
      } catch (e) {
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/login');
        }
      }
    } else {
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/login');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ShaderMask(
                shaderCallback: (bounds) =>
                    AppTheme.primaryGradient.createShader(bounds),
                child: const Text(
                  'SahbiFlix',
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              const CircularProgressIndicator(
                valueColor:
                    AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
