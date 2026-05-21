import React, { useState } from 'react'
import { motion } from 'framer-motion'
import PageTransition from '../components/ui/PageTransition'
import { Search, MoreVertical, Phone, Video, Send, MessageSquare } from 'lucide-react'

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(null)

  const dummyChats = [
    { id: 1, name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80', lastMessage: 'That looks amazing! ✨', time: '2m', unread: 2, online: true },
    { id: 2, name: 'Marcus Neon', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&q=80', lastMessage: 'Are we still meeting at 8?', time: '1h', unread: 0, online: false },
    { id: 3, name: 'Design Team', avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&q=80', lastMessage: 'Alex: Check out the latest Figma file', time: '5h', unread: 5, online: true },
  ]

  const dummyMessages = [
    { id: 1, text: 'Hey, did you see the new mockups?', sender: 'them', time: '10:30 AM' },
    { id: 2, text: 'Yes, they look fantastic! Especially the dark mode.', sender: 'me', time: '10:32 AM' },
    { id: 3, text: 'That looks amazing! ✨', sender: 'them', time: '10:33 AM' },
  ]

  return (
    <PageTransition>
      <div className="flex h-[calc(100vh-64px)] md:h-screen w-full overflow-hidden bg-void relative">
        
        {/* Chat List (Sidebar on Desktop, Full on Mobile if no chat selected) */}
        <div className={`w-full md:w-80 flex-shrink-0 flex flex-col border-r border-border bg-surface ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-heading font-bold mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full bg-void border border-border rounded-full py-2 pl-10 pr-4 text-sm text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto hide-scrollbar p-2">
            {dummyChats.map(chat => (
              <motion.button
                key={chat.id}
                whileHover={{ scale: 0.98 }}
                onClick={() => setActiveChat(chat.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-left ${activeChat === chat.id ? 'bg-elevated' : 'hover:bg-elevated/50'}`}
              >
                <div className="relative">
                  <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm truncate">{chat.name}</span>
                    <span className="text-xs text-muted">{chat.time}</span>
                  </div>
                  <div className="text-xs text-secondary truncate">{chat.lastMessage}</div>
                </div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">
                    {chat.unread}
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-void ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted">
              <MessageSquare size={48} className="mb-4 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="h-16 border-b border-border bg-surface flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button className="md:hidden p-2 -ml-2 text-secondary" onClick={() => setActiveChat(null)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <img src={dummyChats.find(c => c.id === activeChat)?.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h3 className="font-semibold text-sm">{dummyChats.find(c => c.id === activeChat)?.name}</h3>
                    <span className="text-xs text-accent">Active now</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-secondary">
                  <Phone size={20} className="cursor-pointer hover:text-primary transition-colors" />
                  <Video size={20} className="cursor-pointer hover:text-primary transition-colors" />
                  <MoreVertical size={20} className="cursor-pointer hover:text-primary transition-colors" />
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {dummyMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'me' ? 'bg-accent text-white rounded-br-sm' : 'bg-elevated text-primary rounded-bl-sm'}`}>
                      {msg.text}
                      <div className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-white/70' : 'text-muted'}`}>{msg.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 bg-surface border-t border-border">
                <div className="flex items-center gap-2 bg-void rounded-full p-2 border border-border">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 bg-transparent px-3 text-sm focus:outline-none"
                  />
                  <button className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0 hover:bg-accent-hover transition-colors">
                    <Send size={14} className="ml-0.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </PageTransition>
  )
}
