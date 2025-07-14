import React from 'react';
function Alert(props) {
    const capitalize= (word) => {
        const lower = word.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    }
    return (
        <div style={{position:"absolute",top:"10px",right:"45vw"}}>
            {props.alert && <div className={`alert alert-${props.alert.type} alert-dismissible fade show`} role="alert">
                <strong>{capitalize(props.alert.msg)}</strong>
                </div>}
        </div>
        );
}

export default Alert;