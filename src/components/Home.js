import React from 'react';
import ChatInterface from './ChatInterface';
// import ResponsiveChatRoute from './ResponsiveChatRoute';

function Home(props) {
    const { showAlert } = props
    return (
        <>
            <div className="container-fluid p-0">
                <ChatInterface showAlert={showAlert} />
                {/* <ResponsiveChatRoute showAlert={showAlert} /> */}
            </div>
        </>
    );
}
export default Home;