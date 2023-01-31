//! A big doc comment to force the start line to be something other than "1"
//!
//!
//! This should push the error start line down past 1
use std::time::{SystemTime, Duration};

pub fn delta() -> Duration {
        let start = SystemTime::now(); let delta = start.elapsed().unwrap();
        delta
}
