def flow_exists?
  `command -v flow`
  $?.success?
end

describe 'this codebase' do
  if flow_exists?
    it 'passes a flow check' do
      result = `flow`

      expect($?).to be_success, result.to_s
    end
  end
end
