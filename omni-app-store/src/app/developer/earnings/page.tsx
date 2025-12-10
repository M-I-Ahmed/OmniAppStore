"use client";

import DeveloperSideNav from '@/components/developer/DeveloperSideNav';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/contexts/ToastContext';

export default function DeveloperEarnings() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [apps, setApps] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingPayout, setEditingPayout] = useState(false);
  
  const [payoutSettings, setPayoutSettings] = useState({
    paypalEmail: userProfile?.paypalEmail || '',
    bankAccount: userProfile?.bankAccount || '',
    payoutMethod: userProfile?.payoutMethod || 'paypal',
  });

  useEffect(() => {
    if (!loading && (!user || !userProfile?.isDeveloper || userProfile.developerStatus !== 'verified')) {
      router.push('/');
    }
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    if (user && userProfile?.isDeveloper) {
      fetchEarningsData();
    }
  }, [user, userProfile]);

  const fetchEarningsData = async () => {
    if (!user) return;

    setLoadingData(true);
    try {
      const appsQuery = query(
        collection(db, 'Apps'),
        where('developerId', '==', user.uid)
      );
      const appsSnapshot = await getDocs(appsQuery);
      
      const myApps = appsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setApps(myApps);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getTotalEarnings = () => {
    return apps.reduce((sum, app) => sum + ((app.downloads || 0) * (app.AppPrice || 0)), 0);
  };

  const getMonthlyEarnings = () => {
    // Note: For accurate monthly earnings, we'd need to track individual download 
    // transactions with timestamps. Currently showing estimated 30% of total.
    // TODO: Implement download transaction history with timestamps
    return getTotalEarnings() * 0.3;
  };

  const getAvailableBalance = () => {
    // Calculate total earnings minus 15% platform fee
    // In production, also subtract already paid amounts from transaction history
    const totalEarnings = getTotalEarnings();
    const platformFee = totalEarnings * 0.15;
    return totalEarnings - platformFee;
  };

  const handleSavePayoutSettings = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, 'Users', user.uid);
      await updateDoc(userRef, {
        paypalEmail: payoutSettings.paypalEmail,
        bankAccount: payoutSettings.bankAccount,
        payoutMethod: payoutSettings.payoutMethod,
      });

      showToast('Payout settings updated successfully', 'success');
      setEditingPayout(false);
    } catch (error) {
      console.error('Error updating payout settings:', error);
      showToast('Failed to update payout settings', 'error');
    }
  };

  if (loading || loadingData) {
    return (
      <DeveloperSideNav>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DeveloperSideNav>
    );
  }

  if (!user || !userProfile?.isDeveloper) {
    return null;
  }

  return (
    <DeveloperSideNav>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-100 mb-2">
            Earnings
          </h1>
          <p className="text-slate-400">Manage your revenue and payout settings</p>
        </div>

        {/* Earnings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-100 mb-1">${getTotalEarnings().toLocaleString()}</h3>
            <p className="text-slate-400 text-sm">Total Earnings</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-100 mb-1">${getMonthlyEarnings().toLocaleString()}</h3>
            <p className="text-slate-400 text-sm">This Month</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-100 mb-1">${getAvailableBalance().toLocaleString()}</h3>
            <p className="text-slate-400 text-sm">Available Balance</p>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 mb-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Revenue by App</h2>
          
          {apps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No apps published yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apps.map((app) => {
                const revenue = (app.downloads || 0) * (app.AppPrice || 0);
                const percentage = getTotalEarnings() > 0 ? (revenue / getTotalEarnings() * 100) : 0;
                
                return (
                  <div key={app.id} className="bg-slate-800/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-slate-100 font-medium">{app.AppName}</h3>
                        <p className="text-slate-400 text-sm">{app.downloads || 0} downloads × ${app.AppPrice || 0}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold text-xl">${revenue.toLocaleString()}</p>
                        <p className="text-slate-500 text-xs">{percentage.toFixed(1)}% of total</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-600 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payout Settings */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-100">Payout Settings</h2>
            {!editingPayout && (
              <button
                onClick={() => setEditingPayout(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Edit Settings
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2">Payout Method</label>
              <select
                value={payoutSettings.payoutMethod}
                onChange={(e) => setPayoutSettings({ ...payoutSettings, payoutMethod: e.target.value })}
                disabled={!editingPayout}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
              >
                <option value="paypal">PayPal</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            {payoutSettings.payoutMethod === 'paypal' && (
              <div>
                <label className="block text-slate-300 mb-2">PayPal Email</label>
                <input
                  type="email"
                  value={payoutSettings.paypalEmail}
                  onChange={(e) => setPayoutSettings({ ...payoutSettings, paypalEmail: e.target.value })}
                  disabled={!editingPayout}
                  placeholder="your-email@example.com"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                />
              </div>
            )}

            {payoutSettings.payoutMethod === 'bank' && (
              <div>
                <label className="block text-slate-300 mb-2">Bank Account Number</label>
                <input
                  type="text"
                  value={payoutSettings.bankAccount}
                  onChange={(e) => setPayoutSettings({ ...payoutSettings, bankAccount: e.target.value })}
                  disabled={!editingPayout}
                  placeholder="Account number"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                />
              </div>
            )}

            {editingPayout && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSavePayoutSettings}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/20"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingPayout(false)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Transaction History</h2>
          
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-400">No transactions yet</p>
            <p className="text-xs text-slate-600 mt-2">Transaction history will appear here once payouts are processed</p>
          </div>
        </div>
      </div>
    </DeveloperSideNav>
  );
}
