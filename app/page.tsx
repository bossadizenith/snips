import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { Editor } from './components/Editor'
import { Preview } from './components/Preview'

export default function Home() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-black text-black dark:text-white">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex overflow-hidden">
          <Editor />
          <Preview />
        </main>
      </div>
    </div>
  )
}
