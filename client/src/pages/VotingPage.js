import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VotingPage = () => {
  const [amendments, setAmendments] = useState([]);
  const [selectedAmendment, setSelectedAmendment] = useState(null);
  const [choice, setChoice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [voteCounts, setVoteCounts] = useState(null);
  const [adminControls, setAdminControls] = useState(false);
  const navigate = useNavigate();
  const { sessionToken, setSessionToken, userData } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // First verify authentication
        await axios.get('https://constitution-ammendment-2p01.onrender.com/api/v1/auth/check', {
          headers: { Authorization: sessionToken }
        });
        
        // Then fetch amendments
        const response = await axios.get('https://constitution-ammendment-2p01.onrender.com/api/v1/amendments', {
          headers: { Authorization: sessionToken }
        });
        
        setAmendments(response.data);
      } catch (error) {
        console.error('Fetch error:', error);
        if (error.response?.status === 401) {
          navigate('/');
        } else {
          setMessage({
            text: 'Failed to load data. Please try again.',
            type: 'error'
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
  
    if (sessionToken) {
      fetchData();
    } else {
      navigate('/');
    }
  }, [sessionToken, navigate]);

  const openVotingModal = (amendment) => {
    setSelectedAmendment(amendment);
    setChoice('');
    setShowVotingModal(true);
  };

  const closeVotingModal = () => {
    setShowVotingModal(false);
    setSelectedAmendment(null);
    setChoice('');
  };

  const openResultsModal = async (amendment) => {
    try {
      const res = await axios.get(
        `https://constitution-ammendment-2p01.onrender.com/api/v1/vote/public/${amendment._id}`
      );
      setVoteCounts(res.data);
      setShowResultsModal(true);
    } catch (err) {
      setMessage({
        text: 'Failed to load vote results',
        type: 'error'
      });
    }
  };

  const closeResultsModal = () => {
    setShowResultsModal(false);
    setVoteCounts(null);
  };

  // VotingPage.js
  const handleVote = async () => {
    if (!choice || !selectedAmendment) return;
    
    try {
      const response = await axios.post(
        'https://constitution-ammendment-2p01.onrender.com/api/v1/vote',
        { amendmentId: selectedAmendment._id, choice },
        { headers: { Authorization: sessionToken } }
      );
  
      // Update local state only for this specific amendment
      setAmendments(prev => prev.map(amendment => 
        amendment._id === selectedAmendment._id 
          ? { 
              ...amendment, 
              yesVotes: choice === 'YES' ? amendment.yesVotes + 1 : amendment.yesVotes,
              noVotes: choice === 'NO' ? amendment.noVotes + 1 : amendment.noVotes,
              hasVoted: true // Only mark THIS amendment as voted
            } 
          : amendment
      ));
  
      setMessage({ 
        text: `Your vote for ${selectedAmendment.title} has been recorded`, 
        type: 'success' 
      });
      closeVotingModal();
    } catch (error) {
      console.error('Voting error:', error);
      
      let errorMessage = error.response?.data?.message || 
                        `Failed to submit vote for ${selectedAmendment.title}`;
      
      if (error.response?.status === 400) {
        if (error.response.data.message.includes('specific amendment')) {
          errorMessage = "You've already voted on this specific amendment";
        } else {
          errorMessage = "Voting is currently closed for this amendment";
        }
      }
  
      setMessage({ 
        text: errorMessage, 
        type: 'error' 
      });
    }
  };
  const toggleVotingStatus = async (amendmentId, isVotingOpen) => {
    try {
      await axios.put(
        `https://constitution-ammendment-2p01.onrender.com/api/v1/vote/${amendmentId}/toggle-voting`,
        { isVotingOpen },
        { headers: { Authorization: sessionToken } }
      );

      setAmendments(prev => prev.map(amendment => 
        amendment._id === amendmentId 
          ? { ...amendment, isVotingOpen } 
          : amendment
      ));

      setMessage({
        text: `Voting ${isVotingOpen ? 'opened' : 'closed'} successfully`,
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to update voting status',
        type: 'error'
      });
    }
  };

  const toggleResultsVisibility = async (amendmentId, showResults) => {
    try {
      await axios.put(
        `https://constitution-ammendment-2p01.onrender.com/api/v1/vote/${amendmentId}/toggle-results`,
        { showResults },
        { headers: { Authorization: sessionToken } }
      );

      setAmendments(prev => prev.map(amendment => 
        amendment._id === amendmentId 
          ? { ...amendment, showResults } 
          : amendment
      ));

      setMessage({
        text: `Results visibility ${showResults ? 'enabled' : 'disabled'}`,
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to update results visibility',
        type: 'error'
      });
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('https://constitution-ammendment-2p01.onrender.com/api/v1/auth/logout', {}, {
        headers: { Authorization: sessionToken }
      });
      setSessionToken(null);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 bg-opacity-90 bg-[url('https://images.unsplash.com/photo-1579403124614-197f69d8187b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center bg-no-repeat bg-fixed flex items-center justify-center">
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-md mx-4 text-center border-t-8 border-blue-700">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Loading Amendments</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 bg-opacity-90 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center bg-no-repeat bg-fixed px-4 py-8 relative">
      {/* Header with admin/user info */}
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        {adminControls && (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            ADMIN MODE
          </span>
        )}
        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
          {userData?.name || 'User'}
        </span>
        <button
          onClick={handleLogout}
          className="bg-white border border-red-500 text-red-600 hover:bg-red-100 px-3 py-1 sm:px-4 sm:py-2 rounded-md font-semibold flex items-center text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Logout
        </button>
      </div>

      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl text-white font-bold mb-2 font-serif">Constitutional Amendments</h1>
          <p className="text-white text-lg">Select an amendment to {adminControls ? 'manage' : 'vote on'}</p>
        </div>

        {/* Message display */}
        {message.text && (
          <div className={`mb-8 p-4 rounded-lg border-l-4 ${
            message.type === 'success' ? 'bg-green-50 border-green-500' :
            message.type === 'error' ? 'bg-red-50 border-red-500' :
            'bg-blue-50 border-blue-500'
          }`}>
            <div className="flex items-center">
              <svg className={`w-5 h-5 mr-2 ${
                message.type === 'success' ? 'text-green-600' :
                message.type === 'error' ? 'text-red-600' : 'text-blue-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {message.type === 'success' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                )}
              </svg>
              <span className={`
                ${message.type === 'success' ? 'text-green-700' :
                message.type === 'error' ? 'text-red-700' : 'text-blue-700'}
              `}>{message.text}</span>
            </div>
          </div>
        )}

        {/* Amendments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {amendments.map(amendment => (
            <div 
              key={amendment._id} 
              className="bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-blue-500 hover:shadow-lg transition-shadow relative"
            >
              {amendment.isVotingOpen && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  OPEN
                </div>
              )}
              {amendment.showResults && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  RESULTS VISIBLE
                </div>
              )}
              
              <div className="p-5 h-full flex flex-col">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-blue-700 mb-3">{amendment.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{amendment.description}</p>
                  
                  {amendment.showResults && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-green-600">Yes: {amendment.yesVotes}</span>
                        <span className="text-red-600">No: {amendment.noVotes}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full" 
                          style={{ 
                            width: `${amendment.yesVotes + amendment.noVotes > 0 
                              ? (amendment.yesVotes / (amendment.yesVotes + amendment.noVotes)) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 mt-4">
                  {adminControls ? (
                    <>
                      <button
                        onClick={() => toggleVotingStatus(amendment._id, !amendment.isVotingOpen)}
                        className={`w-full py-2 px-4 rounded-md font-medium ${
                          amendment.isVotingOpen
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {amendment.isVotingOpen ? 'Close Voting' : 'Open Voting'}
                      </button>
                      <button
                        onClick={() => toggleResultsVisibility(amendment._id, !amendment.showResults)}
                        className={`w-full py-2 px-4 rounded-md font-medium ${
                          amendment.showResults
                            ? 'bg-gray-600 hover:bg-gray-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {amendment.showResults ? 'Hide Results' : 'Show Results'}
                      </button>
                      <button
                        onClick={() => openResultsModal(amendment)}
                        className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium"
                      >
                        View Votes
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => openVotingModal(amendment)}
                        disabled={!amendment.isVotingOpen}
                        className={`w-full py-2 px-4 rounded-md font-medium ${
                          !amendment.isVotingOpen
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {amendment.isVotingOpen ? 'Vote' : 'Voting Closed'}
                      </button>
                      {amendment.showResults && (
                        <button
                          onClick={() => openResultsModal(amendment)}
                          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                        >
                          View Results
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Voting Modal */}
        {showVotingModal && selectedAmendment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border-t-8 border-blue-700">
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedAmendment.title}</h2>
                  <button 
                    onClick={closeVotingModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Proposed Change:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-line">{selectedAmendment.description}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                  <button
                    onClick={() => setChoice('YES')}
                    className={`flex-1 py-3 px-6 rounded-lg font-bold text-lg transition-all ${
                      choice === 'YES' 
                        ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      VOTE YES
                    </div>
                  </button>
                  <button
                    onClick={() => setChoice('NO')}
                    className={`flex-1 py-3 px-6 rounded-lg font-bold text-lg transition-all ${
                      choice === 'NO' 
                        ? 'bg-red-600 text-white shadow-lg ring-2 ring-red-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      VOTE NO
                    </div>
                  </button>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleVote}
                    disabled={!choice}
                    className={`bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out shadow-md text-lg ${
                      !choice ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    SUBMIT VOTE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Modal */}
        {showResultsModal && voteCounts && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border-t-8 border-blue-700">
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{voteCounts.amendmentTitle} Results</h2>
                  <button 
                    onClick={closeResultsModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-lg font-medium text-green-600">Yes Votes: {voteCounts.yesVotes}</span>
                    <span className="text-lg font-medium text-red-600">No Votes: {voteCounts.noVotes}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-red-500 h-4 rounded-full" 
                      style={{ 
                        width: `${voteCounts.yesVotes + voteCounts.noVotes > 0 
                          ? (voteCounts.yesVotes / (voteCounts.yesVotes + voteCounts.noVotes)) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {adminControls && voteCounts.votes && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Individual Votes:</h3>
                    <div className="overflow-y-auto max-h-96">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voter</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vote</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {voteCounts.votes.map((vote) => (
                            <tr key={vote._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vote.user.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vote.user.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  vote.choice === 'YES' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {vote.choice}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button 
                                  onClick={async () => {
                                    try {
                                      await axios.delete(
                                        `http://localhost:5000/api/v1/vote/${vote._id}`,
                                        { headers: { Authorization: sessionToken } }
                                      );
                                      // Refresh the data
                                      const res = await axios.get(
                                        `http://localhost:5000/api/v1/vote/${selectedAmendment._id}`,
                                        { headers: { Authorization: sessionToken } }
                                      );
                                      setVoteCounts(res.data);
                                      setMessage({
                                        text: 'Vote deleted successfully',
                                        type: 'success'
                                      });
                                    } catch (error) {
                                      setMessage({
                                        text: 'Failed to delete vote',
                                        type: 'error'
                                      });
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingPage;