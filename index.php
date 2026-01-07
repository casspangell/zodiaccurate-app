<?php
session_start();

// Configuration
$USERNAME = 'admin';
$PASSWORD = 'password3396815';

// Handle login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    if ($_POST['username'] === $USERNAME && $_POST['password'] === $PASSWORD) {
        $_SESSION['authenticated'] = true;
    } else {
        $error = 'Invalid username or password';
    }
}

// Handle logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}

// Check authentication
$isAuthenticated = isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true;

// Get files in current directory
function getFiles() {
    $files = [];
    $dir = __DIR__;
    
    if ($handle = opendir($dir)) {
        while (false !== ($entry = readdir($handle))) {
            if ($entry != "." && $entry != ".." && $entry != basename(__FILE__)) {
                $filepath = $dir . '/' . $entry;
                $files[] = [
                    'name' => $entry,
                    'size' => is_file($filepath) ? filesize($filepath) : 0,
                    'modified' => is_file($filepath) ? filemtime($filepath) : 0,
                    'type' => is_dir($filepath) ? 'directory' : 'file'
                ];
            }
        }
        closedir($handle);
    }
    
    // Sort by name
    usort($files, function($a, $b) {
        return strcmp($a['name'], $b['name']);
    });
    
    return $files;
}

function formatBytes($bytes) {
    if ($bytes >= 1073741824) {
        return number_format($bytes / 1073741824, 2) . ' GB';
    } elseif ($bytes >= 1048576) {
        return number_format($bytes / 1048576, 2) . ' MB';
    } elseif ($bytes >= 1024) {
        return number_format($bytes / 1024, 2) . ' KB';
    } else {
        return $bytes . ' bytes';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>zodiaccurate.app - File Browser</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
        }

        .login-container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            margin: 100px auto;
        }

        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 24px;
        }

        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
            font-size: 14px;
        }

        input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.3s;
        }

        input:focus {
            outline: none;
            border-color: #667eea;
        }

        button, .btn {
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            text-decoration: none;
            display: inline-block;
        }

        button:hover, .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        button[type="submit"] {
            width: 100%;
        }

        .error {
            background: #fee;
            color: #c33;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 14px;
            text-align: center;
        }

        .header {
            background: white;
            padding: 20px 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            margin: 0;
            font-size: 28px;
        }

        .logout-btn {
            background: #e74c3c;
            font-size: 14px;
            padding: 10px 20px;
        }

        .logout-btn:hover {
            background: #c0392b;
            box-shadow: 0 5px 20px rgba(231, 76, 60, 0.4);
        }

        .file-browser {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .file-list {
            list-style: none;
        }

        .file-item {
            padding: 16px 30px;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background 0.2s;
        }

        .file-item:hover {
            background: #f8f9fa;
        }

        .file-item:last-child {
            border-bottom: none;
        }

        .file-info {
            flex: 1;
        }

        .file-name {
            font-weight: 500;
            color: #333;
            margin-bottom: 4px;
            word-break: break-all;
        }

        .file-meta {
            font-size: 12px;
            color: #999;
        }

        .file-icon {
            margin-right: 12px;
            font-size: 24px;
        }

        .file-actions a {
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            padding: 8px 16px;
            border-radius: 4px;
            transition: background 0.2s;
        }

        .file-actions a:hover {
            background: #f0f0ff;
        }

        .empty-state {
            padding: 60px 30px;
            text-align: center;
            color: #999;
        }

        .file-left {
            display: flex;
            align-items: center;
            flex: 1;
        }
    </style>
</head>
<body>
    <?php if (!$isAuthenticated): ?>
        <div class="login-container">
            <h1>zodiaccurate.app</h1>
            <p class="subtitle">Please enter your credentials</p>
            
            <?php if (isset($error)): ?>
                <div class="error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            
            <form method="POST">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required autocomplete="username">
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required autocomplete="current-password">
                </div>
                
                <button type="submit" name="login">Sign In</button>
            </form>
        </div>
    <?php else: ?>
        <div class="container">
            <div class="header">
                <h1>zodiaccurate.app</h1>
                <a href="?logout" class="logout-btn">Logout</a>
            </div>
            
            <div class="file-browser">
                <?php 
                $files = getFiles();
                if (empty($files)): 
                ?>
                    <div class="empty-state">
                        <p>No files found in this directory.</p>
                    </div>
                <?php else: ?>
                    <ul class="file-list">
                        <?php foreach ($files as $file): ?>
                            <li class="file-item">
                                <div class="file-left">
                                    <span class="file-icon">
                                        <?php echo $file['type'] === 'directory' ? '📁' : '📄'; ?>
                                    </span>
                                    <div class="file-info">
                                        <div class="file-name"><?php echo htmlspecialchars($file['name']); ?></div>
                                        <div class="file-meta">
                                            <?php if ($file['type'] === 'file'): ?>
                                                <?php echo formatBytes($file['size']); ?> • 
                                                <?php echo date('M j, Y g:i A', $file['modified']); ?>
                                            <?php else: ?>
                                                Directory
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                </div>
                                <?php if ($file['type'] === 'file'): ?>
                                    <div class="file-actions">
                                        <a href="<?php echo htmlspecialchars($file['name']); ?>" download>Download</a>
                                    </div>
                                <?php endif; ?>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>
            </div>
        </div>
    <?php endif; ?>
</body>
</html>