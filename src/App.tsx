/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Phone, 
  MessageSquare, 
  Youtube, 
  Video, 
  CheckCircle2,
  X,
  CreditCard,
  LogOut,
  LogIn,
  Users,
  Home,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Clock,
  Check,
  UserCheck,
  Zap,
  Crown,
  Cpu,
  Sparkles,
  Flame,
  Activity,
  Lock,
  Globe,
  Star,
  TrendingUp,
  Mail,
  Send
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'motion/react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  setDoc,
  getDoc,
  where
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { db, auth } from './firebase';
import { Product, Order, AdminUser, AdminRequest } from './types';

const ADMIN_EMAIL = "moypry1@gmail.com";
const OWNER_PHONE = "01120388971";
const LOGO_URL = "https://cdn.discordapp.com/attachments/1313902041256427561/1481496034021609482/7a0a8a733f978aa5005d0efc385e797f.webp?ex=69b38633&is=69b234b3&hm=bc3a9f17cb0b1370cea987d1e299d02bcdb143436d43a6fc579803d35b2c4d70&";
const DISCORD_URL = "https://discord.gg/GgAPe5nhjv";

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

// Animation Variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'products' | 'admin'>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [transactionId, setTransactionId] = useState('');
  const [myRequest, setMyRequest] = useState<AdminRequest | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  
  // Admin Request Form State
  const [adminForm, setAdminForm] = useState({
    fullName: '',
    age: '',
    country: '',
    experience: '',
    discordUser: ''
  });

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    videoUrl: '',
    category: 'Script'
  });

  const [deliveryForm, setDeliveryForm] = useState({
    email: '',
    productName: '',
    downloadUrl: '',
    message: 'يا هلا بيك يا بطل! تم تجهيز طلبك بنجاح. استمتع بالسكربت الجديد ونتمنى لك تجربة ممتعة في سيرفرك.',
    orderId: ''
  });

  const [isDelivering, setIsDelivering] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setIsSuperAdmin(u.email === ADMIN_EMAIL);
        const adminDoc = await getDoc(doc(db, 'admins', u.uid));
        setIsAdmin(u.email === ADMIN_EMAIL || adminDoc.exists());

        const qMyReq = query(collection(db, 'adminRequests'), where('uid', '==', u.uid));
        const unsubMyReq = onSnapshot(qMyReq, (snapshot) => {
          if (!snapshot.empty) {
            setMyRequest({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as AdminRequest);
          } else {
            setMyRequest(null);
          }
        });
        return () => unsubMyReq();
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setMyRequest(null);
      }
    });

    const qProducts = query(collection(db, 'products'));
    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProducts();
    };
  }, []);

  useEffect(() => {
    if (isAdmin) {
      const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      });

      if (isSuperAdmin) {
        const qAdmins = query(collection(db, 'admins'), orderBy('createdAt', 'desc'));
        const unsubscribeAdmins = onSnapshot(qAdmins, (snapshot) => {
          setAdmins(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminUser)));
        });

        const qRequests = query(collection(db, 'adminRequests'), where('status', '==', 'pending'));
        const unsubscribeRequests = onSnapshot(qRequests, (snapshot) => {
          setAdminRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminRequest)));
        });

        return () => {
          unsubscribeOrders();
          unsubscribeAdmins();
          unsubscribeRequests();
        };
      }

      return () => unsubscribeOrders();
    }
  }, [isAdmin, isSuperAdmin]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleLogout = () => {
    signOut(auth);
    setCurrentPage('home');
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    let finalImageUrl = newProduct.imageUrl;
    
    // If no image is provided but a YouTube video is, use the high-res thumbnail
    if (!finalImageUrl && newProduct.videoUrl) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = newProduct.videoUrl.match(regExp);
      if (match && match[2].length === 11) {
        finalImageUrl = `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
      }
    }

    // Fallback placeholder if absolutely nothing is provided
    if (!finalImageUrl) {
      finalImageUrl = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop";
    }

    await addDoc(collection(db, 'products'), {
      ...newProduct,
      imageUrl: finalImageUrl
    });
    setNewProduct({ name: '', description: '', price: 0, imageUrl: '', videoUrl: '', downloadUrl: '', category: 'Script' });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setDeletingProductId(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert('حدث خطأ أثناء الحذف.');
    }
  };

  const handleRequestAdmin = async () => {
    if (!user) return;
    if (!adminForm.fullName || !adminForm.age || !adminForm.country || !adminForm.experience || !adminForm.discordUser) {
      alert('يرجى ملء جميع البيانات المطلوبة.');
      return;
    }
    try {
      await addDoc(collection(db, 'adminRequests'), {
        uid: user.uid,
        email: user.email,
        ...adminForm,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert('تم إرسال طلبك بنجاح! سيتم إخطار رئيس الإدارة ومراجعة بياناتك.');
    } catch (error) {
      console.error("Error requesting admin:", error);
      alert('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleApproveAdmin = async (request: AdminRequest) => {
    if (!isSuperAdmin) return;
    await setDoc(doc(db, 'admins', request.uid), {
      email: request.email,
      addedBy: user.email,
      createdAt: serverTimestamp()
    });
    await deleteDoc(doc(db, 'adminRequests', request.id!));
  };

  const handleDeclineAdmin = async (id: string) => {
    if (!isSuperAdmin) return;
    await deleteDoc(doc(db, 'adminRequests', id));
  };

  const handleRemoveAdmin = async (id: string) => {
    if (!isSuperAdmin) return;
    await deleteDoc(doc(db, 'admins', id));
  };

  const handlePurchase = (product: Product) => {
    setSelectedProduct(product);
    setShowPaymentModal(true);
    setPaymentStep('input');
  };

  const confirmPayment = async () => {
    if (!selectedProduct) return;
    if (!customerEmail) {
      alert('يرجى إدخال البريد الإلكتروني لاستلام السكربت.');
      return;
    }
    await addDoc(collection(db, 'orders'), {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      customerPhone: 'Discord Ticket',
      customerEmail: customerEmail,
      transactionId: 'Manual',
      amount: selectedProduct.price,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    
    // Redirect to Discord
    window.open(DISCORD_URL, '_blank');
    
    setPaymentStep('success');
    setTimeout(() => {
      setShowPaymentModal(false);
      setCustomerEmail('');
    }, 3000);
  };

  const handleApproveOrder = (order: Order) => {
    setDeliveryForm({
      ...deliveryForm,
      email: order.customerEmail || '',
      productName: order.productName,
      orderId: order.id || ''
    });
    // Scroll to delivery section or just let the admin fill it
    alert(`تم نسخ بيانات العميل: ${order.customerEmail}. يرجى إكمال بيانات التسليم في قسم "مركز التسليم" بالأسفل.`);
  };

  const handleManualDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryForm.email || !deliveryForm.downloadUrl || !deliveryForm.productName) {
      alert('يرجى ملء جميع بيانات التسليم.');
      return;
    }

    setIsDelivering(true);
    try {
      const response = await fetch('/api/send-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: deliveryForm.email,
          productName: deliveryForm.productName,
          downloadUrl: deliveryForm.downloadUrl,
          message: deliveryForm.message,
          adminEmail: user.email
        })
      });

      if (response.ok) {
        // If this delivery is linked to an order, mark it as completed
        if (deliveryForm.orderId) {
          await setDoc(doc(db, 'orders', deliveryForm.orderId), { status: 'completed' }, { merge: true });
        }
        
        alert('تم إرسال الرابط للعميل بنجاح على حسابه في جوجل!');
        setDeliveryForm({
          ...deliveryForm,
          email: '',
          productName: '',
          downloadUrl: '',
          orderId: ''
        });
      } else {
        const data = await response.json();
        alert(`خطأ: ${data.error}`);
      }
    } catch (error) {
      console.error("Delivery error:", error);
      alert('حدث خطأ أثناء الإرسال.');
    } finally {
      setIsDelivering(false);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  return (
    <div className="min-h-screen bg-[#030303] text-[#f8f8f8] font-sans selection:bg-red-600/50 overflow-x-hidden" dir="rtl">
      {/* Animated Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-600 via-red-400 to-red-600 z-[100] origin-left shadow-[0_0_15px_rgba(220,38,38,0.8)]" 
        style={{ scaleX }} 
      />

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.08),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        {/* Moving Light Orbs */}
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] bg-red-600/10 blur-[100px] rounded-full"
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 0],
            y: [0, -50, 0],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] bg-red-900/10 blur-[120px] rounded-full"
        />
      </div>

      {/* Floating Navigation */}
      <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-3xl border-b border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer flex items-center gap-3 group"
                onClick={() => setCurrentPage('home')}
              >
                <motion.div 
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-red-600 blur-lg opacity-0 group-hover:opacity-60 transition-opacity" />
                  <img src={LOGO_URL} alt="Logo" className="w-9 h-9 object-contain relative z-10 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                </motion.div>
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-lg font-black tracking-tighter uppercase italic text-white"
                >
                  𝚈𝙰𝙺𝚄𝚉𝙰 <span className="text-red-600">𝚂𝚃𝙾𝚁</span>
                </motion.span>
              </motion.div>
            </div>

            <div className="hidden md:flex items-center gap-10">
              {[
                { id: 'home', label: 'الرئيسية', icon: Home },
                { id: 'products', label: 'المنتجات', icon: ShoppingBag },
                ...(isAdmin ? [{ id: 'admin', label: 'الإدارة', icon: ShieldCheck }] : [])
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setCurrentPage(item.id as any)}
                  className={`group relative flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${currentPage === item.id ? 'text-red-600' : 'text-gray-500 hover:text-white'}`}
                >
                  <item.icon className={`w-3.5 h-3.5 transition-transform group-hover:-translate-y-1 ${currentPage === item.id ? 'text-red-600' : 'text-gray-600'}`} />
                  {item.label}
                  {currentPage === item.id && (
                    <motion.div 
                      layoutId="nav-glow" 
                      className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-red-600 shadow-[0_0_12px_rgba(220,38,38,1)]" 
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 bg-white/[0.03] pl-1 pr-4 py-1.5 rounded-full border border-white/[0.08] hover:border-red-600/30 transition-all group"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-[8px] font-black text-red-600 uppercase leading-none mb-1 group-hover:animate-pulse">Authorized</p>
                    <p className="text-[11px] font-bold text-gray-200 leading-none">{user.displayName?.split(' ')[0]}</p>
                  </div>
                  <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border-2 border-red-600/20 group-hover:border-red-600 transition-colors" />
                  <button onClick={handleLogout} className="p-1.5 text-gray-600 hover:text-red-500 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(220,38,38,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogin}
                  className="group relative bg-red-600 text-white px-8 py-2.5 rounded-full text-[11px] font-black hover:bg-red-700 transition-all shadow-xl overflow-hidden"
                >
                  <span className="relative z-10">دخول النظام</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {/* Home Page */}
        {currentPage === 'home' && (
          <motion.div 
            key="home"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={staggerContainer}
            className="max-w-5xl mx-auto px-4 py-16"
          >
            <section className="text-center py-12 relative">
              <motion.div
                variants={fadeInUp}
                className="mb-12 relative inline-block"
              >
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-red-600 blur-[60px] rounded-full scale-150" 
                />
                <motion.img 
                  animate={{ 
                    y: [0, -15, 0],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  src={LOGO_URL} 
                  alt="Hero Logo" 
                  className="w-44 h-44 mx-auto relative z-10 drop-shadow-[0_0_40px_rgba(220,38,38,0.4)]" 
                />
              </motion.div>
              
              <motion.div variants={fadeInUp}>
                <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter uppercase italic leading-none">
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-block"
                  >
                    𝚈𝙰𝙺𝚄𝚉𝙰
                  </motion.span>{" "}
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-red-600 drop-shadow-[0_0_25px_rgba(220,38,38,0.6)] inline-block"
                  >
                    𝚂𝚃𝙾𝚁
                  </motion.span>
                </h1>
              </motion.div>
              
              <motion.p 
                variants={fadeInUp}
                className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto mb-16 font-medium leading-relaxed tracking-tight"
              >
                نحن لا نبيع مجرد سكربتات، نحن نصنع <span className="text-white font-black border-b-2 border-red-600">التميز المطلق</span> لسيرفرك. انضم لنخبة المبدعين اليوم.
              </motion.p>

              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap justify-center gap-6"
              >
                <motion.button 
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage('products')}
                  className="group flex items-center gap-4 bg-red-600 px-12 py-5 rounded-2xl font-black text-sm hover:bg-red-700 transition-all shadow-[0_20px_50px_rgba(220,38,38,0.4)]"
                >
                  استكشف الترسانة
                  <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-2 transition-transform" />
                </motion.button>
                <motion.a 
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  href={DISCORD_URL} 
                  target="_blank" 
                  className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.08] px-12 py-5 rounded-2xl font-black text-sm hover:bg-white/[0.08] transition-all backdrop-blur-xl"
                >
                  <DiscordIcon className="w-5 h-5 text-[#5865F2]" />
                  سيرفر الديسكورد
                </motion.a>
              </motion.div>

              {/* Dynamic Stats Bento */}
              <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {[
                  { label: 'سكربت حصري', value: '50+', icon: Zap, color: 'text-red-500' },
                  { label: 'عميل سعيد', value: '1.2k', icon: Users, color: 'text-blue-500' },
                  { label: 'دعم فني', value: '24/7', icon: MessageSquare, color: 'text-green-500' },
                  { label: 'جودة مضمونة', value: '100%', icon: ShieldCheck, color: 'text-yellow-500' }
                ].map((stat, i) => (
                  <motion.div 
                    key={i} 
                    variants={fadeInUp}
                    whileHover={{ y: -10, borderColor: 'rgba(220,38,38,0.3)' }}
                    className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] text-center group transition-all"
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <p className="text-3xl font-black mb-2 text-white">{stat.value}</p>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Animated Admin Request */}
              {user && !isAdmin && (
                <motion.div 
                  variants={fadeInUp}
                  className="mt-32 p-12 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.08] rounded-[3.5rem] max-w-3xl mx-auto relative overflow-hidden group"
                >
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute -top-20 -right-20 w-64 h-64 bg-red-600/10 blur-[80px] rounded-full" 
                  />
                  <ShieldCheck className="w-14 h-14 text-red-600 mx-auto mb-8 group-hover:rotate-12 transition-transform" />
                  <h3 className="text-4xl font-black mb-4 italic">كن جزءاً من الأسطورة</h3>
                  <p className="text-lg text-gray-500 mb-12 max-w-lg mx-auto leading-relaxed">نحن نبحث عن النخبة. قدم طلبك الآن لتنضم لطاقم إدارة ياقوزا الرسمي وتساهم في بناء المستقبل.</p>
                  
                  {myRequest ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col gap-4 text-orange-500 font-black text-xl bg-orange-500/5 py-8 rounded-3xl border border-orange-500/15"
                    >
                      <div className="flex items-center justify-center gap-4">
                        <Clock className="w-6 h-6 animate-spin" />
                        طلبك يخضع للمراجعة الأمنية...
                      </div>
                      <p className="text-xs text-gray-500 font-medium">سيتم إرسال إشعار لرئيس الإدارة بمجرد تقديمك.</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-6 text-right">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mr-2">الاسم الكامل</label>
                          <input 
                            type="text" 
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-red-600 outline-none transition-all"
                            value={adminForm.fullName}
                            onChange={e => setAdminForm({...adminForm, fullName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mr-2">السن</label>
                          <input 
                            type="number" 
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-red-600 outline-none transition-all"
                            value={adminForm.age}
                            onChange={e => setAdminForm({...adminForm, age: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mr-2">الدولة</label>
                          <input 
                            type="text" 
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-red-600 outline-none transition-all"
                            value={adminForm.country}
                            onChange={e => setAdminForm({...adminForm, country: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mr-2">يوزر الديسكورد</label>
                          <input 
                            type="text" 
                            placeholder="username#0000"
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-red-600 outline-none transition-all"
                            value={adminForm.discordUser}
                            onChange={e => setAdminForm({...adminForm, discordUser: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mr-2">الخبرة السابقة</label>
                        <textarea 
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-red-600 outline-none transition-all h-32 resize-none"
                          placeholder="اذكر خبراتك في الإدارة أو البرمجة..."
                          value={adminForm.experience}
                          onChange={e => setAdminForm({...adminForm, experience: e.target.value})}
                        />
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(255,255,255,0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRequestAdmin}
                        className="w-full bg-white text-black py-6 rounded-3xl font-black text-xl hover:bg-gray-100 transition-all shadow-2xl flex items-center justify-center gap-4 mt-8"
                      >
                        <UserPlus className="w-6 h-6" />
                        إرسال طلب التجنيد الرسمي
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </section>
          </motion.div>
        )}

        {/* Products Page */}
        {currentPage === 'products' && (
          <motion.div 
            key="products"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={staggerContainer}
            className="max-w-6xl mx-auto px-4 py-16"
          >
            <motion.div variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="text-right">
                <div className="flex items-center gap-3 text-red-600 font-black uppercase tracking-[0.4em] text-[11px] mb-4">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Elite Script Arsenal
                </div>
                <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter italic uppercase">ترسانة <span className="text-red-600">ياقوزا</span></h2>
                <p className="text-gray-500 text-lg max-w-md leading-tight">كل سكربت هنا هو نتيجة آلاف الساعات من التطوير والابتكار.</p>
              </div>
              <div className="flex gap-4 bg-white/[0.02] p-2 rounded-2xl border border-white/[0.05]">
                {['All', 'Script', 'Map', 'Car'].map(cat => (
                  <button key={cat} className="px-8 py-3 rounded-xl text-[11px] font-black hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest text-gray-500">
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {products.map((product, i) => (
                <motion.div 
                  layout
                  variants={fadeInUp}
                  whileHover={{ y: -15 }}
                  key={product.id}
                  className="group bg-[#080808] border border-white/[0.04] rounded-[2.5rem] overflow-hidden hover:border-red-600/40 transition-all duration-500 flex flex-col shadow-2xl"
                >
                    <div className="aspect-video relative overflow-hidden bg-black">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        referrerPolicy="no-referrer"
                      />
                      {product.videoUrl && (
                        <button 
                          onClick={() => setPreviewProduct(product)}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
                            <Video className="w-8 h-8 text-white fill-current" />
                          </div>
                        </button>
                      )}
                      <div className="absolute top-5 left-5 bg-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl z-20">
                        {product.category}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    </div>
                    <div className="p-10 flex-1 flex flex-col relative">
                      <div className="absolute top-0 right-10 -translate-y-1/2 bg-white text-black px-6 py-2 rounded-2xl font-black text-xl shadow-2xl">
                        {product.price} <span className="text-xs">EGP</span>
                      </div>
                      
                      <h3 className="text-2xl font-black mb-4 group-hover:text-red-600 transition-colors italic uppercase">{product.name}</h3>
                      <p className="text-gray-500 text-sm mb-10 line-clamp-2 leading-relaxed font-medium">{product.description}</p>
                      
                      <div className="mt-auto flex flex-col gap-3">
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePurchase(product)}
                          className="w-full bg-red-600 hover:bg-red-700 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl"
                        >
                          <CreditCard className="w-5 h-5" />
                          اقتناء السكربت
                        </motion.button>
                        
                        {isAdmin && (
                          <div className="flex gap-2">
                            {deletingProductId === product.id ? (
                              <div className="flex-1 flex gap-2">
                                <button 
                                  onClick={() => handleDeleteProduct(product.id!)}
                                  className="flex-1 bg-red-600 py-3 rounded-xl text-[10px] font-black"
                                >
                                  تأكيد الحذف
                                </button>
                                <button 
                                  onClick={() => setDeletingProductId(null)}
                                  className="flex-1 bg-white/10 py-3 rounded-xl text-[10px] font-black"
                                >
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setDeletingProductId(product.id!)}
                                className="w-full py-3 bg-white/[0.03] hover:bg-red-600/20 text-red-600 rounded-xl transition-colors border border-white/[0.05] text-[10px] font-black flex items-center justify-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                حذف المنتج
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                </motion.div>
              ))}
            </div>

            {products.length === 0 && (
              <motion.div 
                variants={fadeInUp}
                className="text-center py-40 bg-white/[0.01] rounded-[4rem] border-2 border-dashed border-white/[0.05]"
              >
                <ShoppingBag className="w-16 h-16 text-gray-800 mx-auto mb-6 opacity-10" />
                <p className="text-gray-700 font-black text-xl uppercase tracking-[0.3em]">المخزن فارغ حالياً</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Admin Page */}
        {currentPage === 'admin' && isAdmin && (
          <motion.div 
            key="admin"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={staggerContainer}
            className="max-w-6xl mx-auto px-4 py-16"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Sidebar */}
              <div className="lg:col-span-4 space-y-8">
                <motion.div variants={fadeInUp} className="bg-red-600 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-10 -right-10 p-4 opacity-10"
                  >
                    <Crown className="w-40 h-40" />
                  </motion.div>
                  <h2 className="text-4xl font-black mb-2 italic relative z-10">غرفة القيادة</h2>
                  <p className="text-red-100 text-sm mb-12 relative z-10">إدارة الترسانة والعمليات الميدانية.</p>
                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-black/20 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                      <p className="text-[9px] font-black uppercase tracking-widest text-red-200 mb-2">المنتجات</p>
                      <p className="text-4xl font-black">{products.length}</p>
                    </div>
                    <div className="bg-black/20 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                      <p className="text-[9px] font-black uppercase tracking-widest text-red-200 mb-2">المبيعات</p>
                      <p className="text-4xl font-black">{orders.length}</p>
                    </div>
                  </div>
                </motion.div>

                {isSuperAdmin && (
                  <motion.div variants={fadeInUp} className="bg-[#0a0a0a] border border-white/[0.04] p-10 rounded-[3rem]">
                    <h3 className="text-xs font-black mb-10 flex items-center gap-3 uppercase tracking-[0.3em]">
                      <UserCheck className="w-5 h-5 text-red-600" />
                      طلبات التجنيد
                    </h3>
                    <div className="space-y-6">
                      {adminRequests.map(req => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={req.id} 
                          className="p-6 bg-white/[0.02] rounded-3xl border border-white/[0.05] space-y-6"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center font-black text-red-500 text-sm">
                              {req.email[0].toUpperCase()}
                            </div>
                            <div className="text-right">
                              <p className="text-[11px] font-black text-white">{req.fullName || req.email}</p>
                              <p className="text-[9px] text-gray-500">{req.discordUser}</p>
                            </div>
                          </div>
                          <div className="bg-black/40 p-4 rounded-2xl text-[10px] text-gray-400 leading-relaxed">
                            <p><span className="text-red-500 font-bold">السن:</span> {req.age}</p>
                            <p><span className="text-red-500 font-bold">الدولة:</span> {req.country}</p>
                            <p className="mt-2 border-t border-white/5 pt-2">{req.experience}</p>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => handleApproveAdmin(req)} className="flex-1 bg-green-600 py-3 rounded-xl text-[10px] font-black hover:bg-green-700 transition-colors">قبول</button>
                            <button onClick={() => handleDeclineAdmin(req.id!)} className="flex-1 bg-red-600 py-3 rounded-xl text-[10px] font-black hover:bg-red-700 transition-colors">رفض</button>
                          </div>
                        </motion.div>
                      ))}
                      {adminRequests.length === 0 && (
                        <div className="text-center py-12 opacity-10">
                          <Users className="w-12 h-12 mx-auto mb-4" />
                          <p className="text-xs font-black uppercase tracking-widest">لا يوجد طلبات حالياً</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-16 pt-16 border-t border-white/[0.05]">
                      <h3 className="text-[11px] font-black mb-8 uppercase tracking-[0.3em] text-gray-600">طاقم العمليات</h3>
                      <div className="space-y-4">
                        {admins.map(admin => (
                          <div key={admin.id} className="flex justify-between items-center p-4 bg-white/[0.01] rounded-2xl border border-white/[0.03] group">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-white/[0.05] rounded-lg flex items-center justify-center font-black text-gray-600 text-[10px]">
                                {admin.email[0].toUpperCase()}
                              </div>
                              <p className="text-[11px] font-bold text-gray-400">{admin.email.split('@')[0]}</p>
                            </div>
                            <button onClick={() => handleRemoveAdmin(admin.id!)} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Main Area */}
              <div className="lg:col-span-8 space-y-10">
                <motion.div variants={fadeInUp} className="bg-[#0f0f0f] border border-white/[0.08] p-12 rounded-[3.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                  <h3 className="text-2xl font-black mb-10 flex items-center gap-4 italic text-white">
                    <Plus className="w-8 h-8 text-red-600" />
                    إضافة سلاح جديد
                  </h3>
                  <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3">اسم السكربت</label>
                      <input 
                        type="text" 
                        placeholder="YAKUZA EXCLUSIVE" 
                        className="w-full bg-[#151515] border border-white/[0.1] rounded-2xl px-6 py-5 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600/50 outline-none transition-all font-bold text-white placeholder:text-gray-700"
                        value={newProduct.name}
                        onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3">القيمة (EGP)</label>
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        className="w-full bg-[#151515] border border-white/[0.1] rounded-2xl px-6 py-5 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600/50 outline-none transition-all text-center font-black text-red-600 text-xl placeholder:text-red-900/30"
                        value={newProduct.price || ''}
                        onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                        required
                      />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3">الوصف التقني</label>
                      <textarea 
                        placeholder="اشرح قوة هذا السكربت..." 
                        className="w-full bg-[#151515] border border-white/[0.1] rounded-2xl px-6 py-5 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600/50 outline-none transition-all h-40 resize-none leading-relaxed text-white placeholder:text-gray-700"
                        value={newProduct.description}
                        onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3">رابط الغلاف (اختياري)</label>
                      <input 
                        type="url" 
                        placeholder="https://..." 
                        className="w-full bg-[#151515] border border-white/[0.1] rounded-2xl px-6 py-5 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600/50 outline-none transition-all text-white placeholder:text-gray-700"
                        value={newProduct.imageUrl}
                        onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3">رابط الاستعراض (اختياري)</label>
                      <input 
                        type="url" 
                        placeholder="https://youtube.com/..." 
                        className="w-full bg-[#151515] border border-white/[0.1] rounded-2xl px-6 py-5 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600/50 outline-none transition-all text-white placeholder:text-gray-700"
                        value={newProduct.videoUrl}
                        onChange={e => setNewProduct({...newProduct, videoUrl: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3">التصنيف</label>
                      <select 
                        className="w-full bg-[#151515] border border-white/[0.1] rounded-2xl px-6 py-5 text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600/50 outline-none transition-all font-bold text-white appearance-none cursor-pointer"
                        value={newProduct.category}
                        onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                        required
                      >
                        <option value="Script">Script (سكربت)</option>
                        <option value="Map">Map (ماب)</option>
                        <option value="Car">Car (سيارة)</option>
                        <option value="Other">Other (أخرى)</option>
                      </select>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.01, boxShadow: "0 0 40px rgba(220,38,38,0.3)" }}
                      whileTap={{ scale: 0.99 }}
                      type="submit" 
                      className="w-full bg-red-600 py-6 rounded-2xl font-black text-lg md:col-span-2 mt-6 shadow-2xl hover:bg-red-700 transition-all uppercase tracking-widest"
                    >
                      تأكيد النشر في الترسانة
                    </motion.button>
                  </form>
                </motion.div>

                {/* Manual Delivery Center */}
                <motion.div variants={fadeInUp} className="bg-[#0a0a0a] border border-white/[0.04] p-12 rounded-[3.5rem] overflow-hidden">
                  <h3 className="text-2xl font-black mb-10 flex items-center gap-4 italic">
                    <Mail className="w-8 h-8 text-red-600" />
                    مركز التسليم اليدوي (Google/Gmail)
                  </h3>
                  <form onSubmit={handleManualDelivery} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3">حساب جوجل للعميل</label>
                      <input 
                        type="email" 
                        placeholder="customer@gmail.com" 
                        className="w-full bg-[#151515] border border-white/[0.1] rounded-2xl px-6 py-5 text-sm focus:border-red-600 outline-none transition-all font-bold text-white"
                        value={deliveryForm.email}
                        onChange={e => setDeliveryForm({...deliveryForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3">اسم المنتج</label>
                      <input 
                        type="text" 
                        placeholder="YAKUZA SCRIPT" 
                        className="w-full bg-[#151515] border border-white/[0.1] rounded-2xl px-6 py-5 text-sm focus:border-red-600 outline-none transition-all font-bold text-white"
                        value={deliveryForm.productName}
                        onChange={e => setDeliveryForm({...deliveryForm, productName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-black text-red-600 uppercase tracking-widest mr-3">رابط التحميل المباشر</label>
                      <input 
                        type="url" 
                        placeholder="https://mega.nz/..." 
                        className="w-full bg-[#151515] border border-red-600/20 rounded-2xl px-6 py-5 text-sm focus:border-red-600 outline-none transition-all text-white font-mono"
                        value={deliveryForm.downloadUrl}
                        onChange={e => setDeliveryForm({...deliveryForm, downloadUrl: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3">الكلمة الحلوة (رسالة التسليم)</label>
                      <textarea 
                        className="w-full bg-[#151515] border border-white/[0.1] rounded-2xl px-6 py-5 text-sm focus:border-red-600 outline-none transition-all h-32 resize-none text-white"
                        value={deliveryForm.message}
                        onChange={e => setDeliveryForm({...deliveryForm, message: e.target.value})}
                      />
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      disabled={isDelivering}
                      type="submit" 
                      className="w-full bg-red-600 py-6 rounded-2xl font-black text-lg md:col-span-2 mt-6 shadow-2xl hover:bg-red-700 transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                      {isDelivering ? 'جاري الإرسال...' : 'إرسال لبريد العميل فوراً'}
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </form>
                </motion.div>

                {/* Manual Delivery Center */}
                <motion.div variants={fadeInUp} className="bg-[#0a0a0a] border border-white/[0.04] p-12 rounded-[3.5rem] overflow-hidden">
                  <h3 className="text-2xl font-black mb-10 flex items-center gap-4 italic">
                    <Mail className="w-8 h-8 text-red-600" />
                    مركز التسليم اليدوي (Google/Gmail)
                  </h3>
                  <form onSubmit={handleManualDelivery} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3">حساب جوجل للعميل</label>
                      <input 
                        type="email" 
                        placeholder="customer@gmail.com" 
                        className="w-full bg-[#151515] border border-white/[0.1] rounded-2xl px-6 py-5 text-sm focus:border-red-600 outline-none transition-all font-bold text-white"
                        value={deliveryForm.email}
                        onChange={e => setDeliveryForm({...deliveryForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3">اسم المنتج</label>
                      <input 
                        type="text" 
                        placeholder="YAKUZA SCRIPT" 
                        className="w-full bg-[#151515] border border-white/[0.1] rounded-2xl px-6 py-5 text-sm focus:border-red-600 outline-none transition-all font-bold text-white"
                        value={deliveryForm.productName}
                        onChange={e => setDeliveryForm({...deliveryForm, productName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-black text-red-600 uppercase tracking-widest mr-3">رابط التحميل المباشر</label>
                      <input 
                        type="url" 
                        placeholder="https://mega.nz/..." 
                        className="w-full bg-[#151515] border border-red-600/20 rounded-2xl px-6 py-5 text-sm focus:border-red-600 outline-none transition-all text-white font-mono"
                        value={deliveryForm.downloadUrl}
                        onChange={e => setDeliveryForm({...deliveryForm, downloadUrl: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3">الكلمة الحلوة (رسالة التسليم)</label>
                      <textarea 
                        className="w-full bg-[#151515] border border-white/[0.1] rounded-2xl px-6 py-5 text-sm focus:border-red-600 outline-none transition-all h-32 resize-none text-white"
                        value={deliveryForm.message}
                        onChange={e => setDeliveryForm({...deliveryForm, message: e.target.value})}
                      />
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      disabled={isDelivering}
                      type="submit" 
                      className="w-full bg-red-600 py-6 rounded-2xl font-black text-lg md:col-span-2 mt-6 shadow-2xl hover:bg-red-700 transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                      {isDelivering ? 'جاري الإرسال...' : 'إرسال لبريد العميل فوراً'}
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </form>
                </motion.div>

                <motion.div variants={fadeInUp} className="bg-[#0a0a0a] border border-white/[0.04] p-12 rounded-[3.5rem] overflow-hidden">
                  <h3 className="text-2xl font-black mb-10 flex items-center gap-4 italic">
                    <CreditCard className="w-8 h-8 text-red-600" />
                    سجل العمليات الناجحة
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-[11px]">
                      <thead>
                        <tr className="text-gray-600 border-b border-white/[0.08]">
                          <th className="pb-6 font-black uppercase tracking-[0.2em]">المنتج</th>
                          <th className="pb-6 font-black uppercase tracking-[0.2em]">العميل</th>
                          <th className="pb-6 font-black uppercase tracking-[0.2em]">المبلغ</th>
                          <th className="pb-6 font-black uppercase tracking-[0.2em]">التاريخ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {orders.map(order => (
                          <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-6 font-black text-red-500 text-base italic">{order.productName}</td>
                            <td className="py-6 font-mono text-gray-400">
                              <div>{order.customerPhone}</div>
                              <div className="text-[9px] text-gray-600">{order.customerEmail}</div>
                            </td>
                            <td className="py-6 font-black text-base">
                              <div>{order.amount} EGP</div>
                              <div className="text-[9px] text-blue-500 font-mono">ID: {order.transactionId}</div>
                            </td>
                            <td className="py-6 text-gray-600 font-bold">
                              {order.status === 'pending' ? (
                                <button 
                                  onClick={() => handleApproveOrder(order)}
                                  className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] hover:bg-green-700 transition-all"
                                >
                                  تأكيد وإرسال الرابط
                                </button>
                              ) : (
                                <span className="text-green-500 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  تم التسليم
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refined Footer */}
      <footer className="bg-black border-t border-white/[0.05] py-24 mt-40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center justify-center gap-4 mb-10 cursor-pointer"
          >
            <img src={LOGO_URL} alt="Logo" className="w-10 h-10" />
            <span className="text-3xl font-black italic tracking-tighter">𝚈𝙰𝙺𝚄𝚉𝙰 <span className="text-red-600">𝚂𝚃𝙾𝚁</span></span>
          </motion.div>
          <p className="text-gray-500 text-lg mb-12 max-w-lg mx-auto leading-relaxed font-medium">نحن القمة في عالم FiveM. جودة، أمان، واحترافية لا تضاهى. انضم إلينا اليوم.</p>
          <div className="flex justify-center gap-8">
            {[
              { icon: DiscordIcon, url: DISCORD_URL, color: 'hover:text-[#5865F2]' },
              { icon: Youtube, url: '#', color: 'hover:text-[#FF0000]' },
              { icon: Activity, url: '#', color: 'hover:text-red-500' }
            ].map((social, i) => (
              <motion.a 
                key={i}
                whileHover={{ y: -5, scale: 1.2 }}
                href={social.url} 
                target="_blank" 
                className={`p-5 bg-white/[0.02] rounded-[1.5rem] transition-all border border-white/[0.05] ${social.color}`}
              >
                <social.icon className="w-6 h-6" />
              </motion.a>
            ))}
          </div>
          <div className="mt-20 pt-12 border-t border-white/[0.05]">
            <p className="text-[10px] text-gray-800 font-black uppercase tracking-[1em]">© 2026 𝚈𝙰𝙺𝚄𝚉𝙰 𝚂𝚃𝙾𝚁. THE ELITE SYNDICATE.</p>
          </div>
        </div>
      </footer>

      {/* Dynamic Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="absolute inset-0 bg-black/98 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-[#080808] border border-white/[0.08] w-full max-w-md rounded-[3.5rem] p-12 shadow-[0_0_150px_rgba(220,38,38,0.3)] overflow-hidden"
              dir="rtl"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,1)]" />
              <button onClick={() => setShowPaymentModal(false)} className="absolute top-8 left-8 p-3 text-gray-600 hover:text-white transition-colors bg-white/5 rounded-full"><X className="w-6 h-6" /></button>

              {paymentStep === 'input' && (
                <div className="text-center">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 bg-red-600/15 rounded-3xl flex items-center justify-center mx-auto mb-10"
                  >
                    <DiscordIcon className="w-10 h-10 text-red-600" />
                  </motion.div>
                  <h2 className="text-3xl font-black mb-3 italic">طلب {selectedProduct.name}</h2>
                  <p className="text-gray-500 text-sm mb-12 font-medium">أدخل بريدك الإلكتروني ثم توجه للديسكورد لإتمام الدفع واستلام السكربت</p>
                  
                  <div className="space-y-8">
                    <div className="text-right">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 block mr-3">البريد الإلكتروني (Gmail)</label>
                      <input 
                        type="email" 
                        placeholder="example@gmail.com"
                        className="w-full bg-black border border-white/[0.08] rounded-3xl px-8 py-6 text-xl font-bold text-center focus:border-red-600 outline-none transition-all text-white shadow-2xl"
                        value={customerEmail}
                        onChange={e => setCustomerEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="bg-red-600/5 p-8 rounded-3xl text-right border border-red-600/15 relative overflow-hidden">
                      <p className="text-[10px] text-red-400 uppercase font-black mb-2">سعر المنتج:</p>
                      <p className="text-5xl font-black text-red-600">{selectedProduct.price} <span className="text-xl">EGP</span></p>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={confirmPayment}
                      disabled={!customerEmail}
                      className="w-full bg-red-600 py-6 rounded-3xl font-black text-lg hover:bg-red-700 transition-all shadow-2xl uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                      <DiscordIcon className="w-6 h-6" />
                      فتح تذكرة وإتمام الطلب
                    </motion.button>
                  </div>
                </div>
              )}

              {paymentStep === 'confirm' && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-600/15 rounded-3xl flex items-center justify-center mx-auto mb-10">
                    <CheckCircle2 className="w-10 h-10 text-blue-500" />
                  </div>
                  <h2 className="text-3xl font-black mb-3 italic">تأكيد التحويل</h2>
                  <p className="text-gray-500 text-sm mb-8 font-medium">قم بتحويل المبلغ إلى الرقم <span className="text-white font-bold">{OWNER_PHONE}</span> ثم أدخل رقم العملية (ID) الموجود في رسالة فودافون</p>
                  
                  <div className="text-right mb-8">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 block mr-3">رقم العملية (Transaction ID)</label>
                    <input 
                      type="text" 
                      placeholder="أدخل رقم العملية هنا"
                      className="w-full bg-black border border-white/[0.08] rounded-3xl px-8 py-6 text-xl font-mono text-center focus:border-red-600 outline-none shadow-2xl text-white"
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmPayment} 
                    disabled={!transactionId} 
                    className="w-full bg-red-600 py-6 rounded-3xl font-black text-lg shadow-2xl hover:bg-red-700 transition-all"
                  >
                    إرسال الطلب للمراجعة
                  </motion.button>
                  
                  <p className="mt-6 text-[10px] text-gray-600 font-bold">سيتم تفعيل السكربت لك فور تأكد الإدارة من وصول المبلغ.</p>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="text-center py-12">
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-24 h-24 bg-blue-500/15 rounded-full flex items-center justify-center mx-auto mb-8"
                  >
                    <DiscordIcon className="w-14 h-14 text-blue-500" />
                  </motion.div>
                  <h2 className="text-4xl font-black mb-4 italic text-white">توجه للديسكورد</h2>
                  <p className="text-gray-500 text-lg leading-relaxed font-medium">تم فتح صفحة الديسكورد. يرجى فتح تذكرة (Ticket) لإتمام الدفع، وسنقوم بإرسال السكربت لإيميلك فور التأكيد.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Video Preview Modal */}
      <AnimatePresence>
        {previewProduct && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewProduct(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl aspect-video bg-black rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.3)] border border-white/10"
              style={{
                backgroundImage: `url(${previewProduct.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <button 
                onClick={() => setPreviewProduct(null)}
                className="absolute top-6 left-6 z-30 p-3 bg-black/50 hover:bg-red-600 text-white rounded-full transition-all backdrop-blur-md border border-white/10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-10" />

              {previewProduct.videoUrl && getYouTubeEmbedUrl(previewProduct.videoUrl) && (
                <iframe 
                  src={`${getYouTubeEmbedUrl(previewProduct.videoUrl)}?autoplay=1&rel=0&modestbranding=1`}
                  className="w-full h-full relative z-20"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #111; border-radius: 10px; border: 1px solid #000; }
        ::-webkit-scrollbar-thumb:hover { background: #dc2626; }
        body { background-color: #030303; }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}} />
    </div>
  );
}
