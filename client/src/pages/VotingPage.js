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
  
  const fetchVoteStatusForAmendment = async (amendmentId) => {
  try {
    const res = await axios.get(
      `https://constitution-ammendment-2p01.onrender.com/api/v1/vote/${amendmentId}/has-voted`,
      { headers: { Authorization: sessionToken } }
    );

    const data = res.data; // ✅ Axios stores response data here

    setAmendments((prev) =>
      prev.map((amendment) =>
        amendment._id === amendmentId
          ? { ...amendment, voted: data.hasVoted, voteInfo: data.vote }
          : amendment
      )
    );

    console.log('Updated amendments:', amendments);
  } catch (err) {
    console.error('Failed to fetch vote status for amendment', err);
  }
};


  const fetchVoteStatuses = async (amendments) => {
    try {
      const updatedAmendments = await Promise.all(
        amendments.map(async (amendment) => {
          const res = await axios.get(
            `https://constitution-ammendment-2p01.onrender.com/api/v1/vote/${amendment._id}/has-voted`,
            { headers: { Authorization: sessionToken } }
          );
  
          return {
            ...amendment,
            voted: res.data,
          };
        })
      );  
      setAmendments(updatedAmendments);
      console.log(updatedAmendments);
    } catch (error) {
      console.error('Failed to fetch vote statuses', error);
    }
  };

  
  useEffect(() => {
    const fetchAmendments = async () => {
      try {
        const res = await axios.get(
          `https://constitution-ammendment-2p01.onrender.com/api/v1/amendments`,
          { headers: { Authorization: sessionToken } }
        );
  
        setAmendments(res.data);
        console.log(amendments);
      } catch (error) {
        console.error('Failed to fetch amendments', error);
      }
    };
  
    fetchAmendments();
  }, []);
    
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
  const handleVoteSubmit = async (amendmentId, choice) => {
    try {
      await axios.post(
        `https://constitution-ammendment-2p01.onrender.com/api/v1/vote`,
        { amendmentId, choice },
        { headers: { Authorization: sessionToken } }
      );
  
      // Update the local amendment state to reflect that user has voted
      setAmendments(prev =>
        prev.map(a =>
          a._id === amendmentId ? { ...a, hasUserVoted: true } : a
        )
      );
  
      closeVotingModal();
      setMessage({
        text: 'Vote submitted successfully',
        type: 'success'
      });
  
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Vote submission failed',
        type: 'error'
      });
    }
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
      <div className="min-h-screen bg-gray-100 bg-opacity-90 bg-[url('https://images.unsplash.com/photo-1571321278340-39e4fe3c1f66?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center bg-no-repeat bg-fixed flex items-center justify-center">
       <div
          className="bg-white p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-md mx-4 flex items-center border-t-8"
            style={{ borderTopColor: '#189AB4' }}
        >

          {/* Text Section */}
          <div className="text-center flex-1">
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderTopColor: '#05445E' }}></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Loading Amendments</h3>
          </div>
          
          {/* Image Section */}
          <div className="ml-4 w-24 h-24">
            <img src="/busy_nisbot.png" alt="Loading" className="w-full h-full object-cover rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-opacity-90 bg-[url('https://images.unsplash.com/photo-1571321278340-39e4fe3c1f66?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center bg-no-repeat bg-fixed">
      <div className="absolute top-4 right-4 flex items-center space-x-4 my-2">
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
        <div className="text-center mb-5 sticky mt-10">
          <h1 className="text-3xl sm:text-4xl text-black font-bold my-19 font-serif text-center" >Constitution Amendments</h1>
        </div>

        {/* Message display */}
        {message.text && (
          <div className={`absolute mb-8 p-4 rounded-lg border-l-4 ${
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

{/*amendment grid*/}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 relative p-8">
  {[...amendments]
  .sort((a, b) => {
    const numA = parseInt(a.title.match(/\d+/));
    const numB = parseInt(b.title.match(/\d+/));
    return numA - numB;
  })
  .map(amendment => (
  <div 
    key={amendment._id} 
    className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 hover:shadow-md transition-shadow relative p-2" 
    style={{ borderTopColor: '#189AB4' }}
    onMouseEnter={() => {
      if (amendment.voted === undefined) {
        fetchVoteStatusForAmendment(amendment._id);
      }
    }} // Corrected here, added missing closing parenthesis
  >
      {/* Status Badges */}
      {amendment.isVotingOpen && (
        <div className="absolute top-2 right-2 bg-green-100 text-green-700 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border border-green-300 shadow-sm">
          OPEN
        </div>
      )}
   

      {/* Card Content */}
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <h3 className="text-base sm:text-lg font-bold mb-2" style={{color: '#05445E'}}>
            {amendment.title}
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2 flex-wrap">
          {adminControls ? (
            <>
<button
  onClick={() => {
    if (!amendment.voted) openVotingModal(amendment);
  }}
  disabled={!amendment.isVotingOpen || !amendment.voted}
  className={`flex-1 min-w-[48%] text-xs py-1.5 px-3 rounded-md font-medium transition-all duration-200 ${
    !amendment.isVotingOpen || amendment.voted
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-[#05445E] text-white hover:bg-[#033649]'
  }`}
>
  {!amendment.isVotingOpen
    ? 'Voting Closed'
    : amendment.voted
    ? 'Already Voted'
    : 'Vote'}
</button>


              <button
                onClick={() => openResultsModal(amendment)}
                className="flex-1 min-w-[48%] text-xs py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium"
              >
                View Votes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openVotingModal(amendment)}
                disabled={!amendment.isVotingOpen || amendment.voted}
                className={`flex-1 min-w-[48%] text-xs py-1.5 px-3 rounded-md font-medium ${
                  !amendment.isVotingOpen || amendment.voted
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {!amendment.isVotingOpen
                  ? 'Voting Closed'
                  : amendment.voted
                  ? 'Already Voted'
                  : 'Vote'}
              </button>

              {amendment.showResults && (
               <button
               onClick={() => openResultsModal(amendment)}
               className="flex-1 min-w-[48%] text-xs py-1.5 px-3 bg-[#189AB4] hover:bg-[#033649] text-white rounded-md font-medium transition duration-300 ease-in-out"
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border-t-8" style={{ borderTopColor: '#189AB4' }}>
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
      ? 'bg-[#05445E] text-white shadow-lg ring-2 ring-[#88C9E0]'  // selected state
      : 'bg-[#D4F1F4] hover:bg-[#B0D9E2] text-[#05445E]'            // unselected state
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
      ? 'bg-[#033649] text-white shadow-lg ring-2 ring-[#88C9E0]' // selected state
      : 'bg-[#D4F1F4] hover:bg-[#B0D9E2] text-[#033649]'           // unselected state
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
  className={`text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out shadow-md ${
    !choice
      ? 'bg-[#05445E] opacity-50 cursor-not-allowed'
      : 'bg-[#05445E] hover:bg-[#033649]'
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border-t-8 " style={{ borderTopColor: '#189AB4' }}>
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
                    <span className="text-lg font-medium" style={{ color: '#05445E' }}>
                      Yes: {voteCounts.yesVotes}
                    </span>
                    <span className="text-lg font-medium" style={{ color: '#05445E' }}>No: {voteCounts.noVotes}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                 {/* Vote Result Bar */}
<div className="w-full max-w-md h-4 rounded-full overflow-hidden flex mt-4 shadow-inner bg-gray-200">
  {/* YES Votes */}
  <div
    className="h-full transition-all duration-500"
    style={{
      backgroundColor:
        voteCounts.yesVotes >= voteCounts.noVotes ? '#05445E' : '#D4E9F7',
      width: `${
        voteCounts.yesVotes + voteCounts.noVotes > 0
          ? (voteCounts.yesVotes / (voteCounts.yesVotes + voteCounts.noVotes)) * 100
          : 0
      }%`,
    }}
  ></div>

  {/* NO Votes */}
  <div
    className="h-full transition-all duration-500"
    style={{
      backgroundColor:
        voteCounts.noVotes > voteCounts.yesVotes ? '#05445E' : '#D4E9F7',
      width: `${
        voteCounts.yesVotes + voteCounts.noVotes > 0
          ? (voteCounts.noVotes / (voteCounts.yesVotes + voteCounts.noVotes)) * 100
          : 0
      }%`,
    }}
  ></div>
</div>
</div>
              <div className="mt-4 text-center">
  {(voteCounts.yesVotes + voteCounts.noVotes) > 0 ? (
    voteCounts.yesVotes >= (2 / 3) * (voteCounts.yesVotes + voteCounts.noVotes) ? (
      <p className="text-[#05445E] font-semibold text-lg">Amendment Passed</p>
    ) : (
      <p className="text-[#05445E] font-semibold text-lg">Amendment Failed</p>
    )
  ) : (
    <p className="text-gray-500 italic">No votes recorded yet.</p>
  )}
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
                                        `https://constitution-ammendment-2p01.onrender.com/api/v1/vote/${vote._id}`,
                                        { headers: { Authorization: sessionToken } }
                                      );
                                      // Refresh the data
                                      const res = await axios.get(
                                        `https://constitution-ammendment-2p01.onrender.com/api/v1/vote/${selectedAmendment._id}`,
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