const roleBasedMiddleware = (requiredRole) => (req, res, next)=>{
    try {
        if(!requiredRole.includes(req.user.department)){
            return res.status(403).json({roleErr: 'You are not authorised to view this content'});
        }
        next();
    } catch (error) {
            return res.status(401).json({error: 'Please authenticate using a valid token'});
    }
}

module.exports = roleBasedMiddleware;