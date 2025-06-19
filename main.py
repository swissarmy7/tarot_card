"""
Flask wrapper for PHP-based AI Tarot Card Reading Application
"""

from flask import Flask, request, Response
import subprocess
import os
import tempfile
import json

app = Flask(__name__)


def run_php_script(script_path, method='GET', post_data=None, query_string=''):
    """Run PHP script and return response"""

    # Set up environment variables for PHP
    env = os.environ.copy()
    env['REQUEST_METHOD'] = method
    env['SCRIPT_NAME'] = '/' + script_path
    env['PATH_INFO'] = ''
    env['QUERY_STRING'] = query_string
    env['SERVER_NAME'] = 'localhost'
    env['SERVER_PORT'] = '5000'
    env['HTTP_HOST'] = 'localhost:5000'
    env['HTTPS'] = 'off'
    env['SERVER_PROTOCOL'] = 'HTTP/1.1'

    if method == 'POST' and post_data:
        env['CONTENT_TYPE'] = request.headers.get('Content-Type', 'application/json')
        env['CONTENT_LENGTH'] = str(len(post_data))

    # Set HTTP headers as environment variables
    for header, value in request.headers:
        header_name = 'HTTP_' + header.upper().replace('-', '_')
        env[header_name] = value

    try:
        if method == 'POST' and post_data:
            # Ensure post_data is bytes
            if isinstance(post_data, str):
                post_data_bytes = post_data.encode('utf-8')
            else:
                post_data_bytes = post_data

            proc = subprocess.Popen(
                ['php', script_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=env,
                cwd='.'
            )
            stdout, stderr = proc.communicate(input=post_data_bytes)
        else:
            proc = subprocess.Popen(
                ['php', script_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=env,
                cwd='.'
            )
            stdout, stderr = proc.communicate()

        if proc.returncode != 0:
            print(f"PHP Error: {stderr.decode('utf-8')}")
            return Response("Internal Server Error", status=500)

        output = stdout.decode('utf-8')

        # Parse headers and body
        if '\r\n\r\n' in output:
            header_part, body = output.split('\r\n\r\n', 1)
        elif '\n\n' in output:
            header_part, body = output.split('\n\n', 1)
        else:
            header_part = ''
            body = output

        # Create response
        response = Response(body)

        # Parse and set headers
        if header_part:
            for line in header_part.split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    response.headers[key.strip()] = value.strip()

        # Set default content type if not specified
        if 'Content-Type' not in response.headers:
            if script_path.endswith('api.php'):
                response.headers['Content-Type'] = 'application/json'
            else:
                response.headers['Content-Type'] = 'text/html; charset=utf-8'

        return response

    except Exception as e:
        print(f"Error running PHP: {e}")
        return Response("Internal Server Error", status=500)


@app.route('/')
def index():
    """Serve main PHP page"""
    return run_php_script('index.php')


@app.route('/api.php', methods=['GET', 'POST'])
def api():
    """Handle API requests"""
    if request.method == 'POST':
        # Get JSON data from request
        if request.is_json:
            post_data = request.get_json()
            post_data_str = json.dumps(post_data)
        else:
            post_data_str = request.get_data(as_text=True)

        return run_php_script('api.php', 'POST', post_data_str)
    else:
        return run_php_script('api.php')


@app.route('/<path:filename>')
def static_files(filename):
    """Serve static files"""
    if filename.endswith('.php'):
        return run_php_script(filename)
    else:
        # For CSS, JS, JSON files
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()

            # Set appropriate content type
            if filename.endswith('.css'):
                response = Response(content, mimetype='text/css')
            elif filename.endswith('.js'):
                response = Response(content, mimetype='application/javascript')
            elif filename.endswith('.json'):
                response = Response(content, mimetype='application/json')
            else:
                response = Response(content)

            return response
        except FileNotFoundError:
            return Response("File not found", status=404)
        except Exception as e:
            print(f"Error serving static file: {e}")
            return Response("Internal Server Error", status=500)


if __name__ == '__main__':
    # For development
    app.run(host='0.0.0.0', port=5000, debug=True)